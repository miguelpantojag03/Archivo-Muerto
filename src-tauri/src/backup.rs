// ─── backup ───────────────────────────────────────────────────────
// Full backup/restore: zips the SQLite snapshot (already VACUUM INTO'd
// by the caller, since that must run through the live sql plugin
// connection) together with the attachments/ and covers/ folders.
//
// Restore never touches the live db file while the app is running —
// Windows keeps it locked and a mid-write swap can corrupt it. Instead
// it writes everything to `*.pending` siblings; apply_pending_restore()
// swaps them in during .setup(), before any frontend JS (and therefore
// before the sql plugin's lazy connection) has run.

use std::fs::{self, File};
use std::io::{Read, Write};
use std::path::{Path, PathBuf};
use tauri::{AppHandle, Manager};
use zip::write::SimpleFileOptions;
use zip::{CompressionMethod, ZipArchive, ZipWriter};

const DB_FILENAME: &str = "archivo_muerto.db";

fn add_dir_to_zip(zip: &mut ZipWriter<File>, dir: &Path, prefix: &str) -> Result<(), String> {
  if !dir.exists() {
    return Ok(());
  }
  let options = SimpleFileOptions::default().compression_method(CompressionMethod::Deflated);
  for entry in walkdir::WalkDir::new(dir).into_iter().filter_map(|e| e.ok()) {
    let path = entry.path();
    if !path.is_file() {
      continue;
    }
    let rel = path.strip_prefix(dir).map_err(|e| e.to_string())?;
    let name = format!("{}/{}", prefix, rel.to_string_lossy().replace('\\', "/"));
    zip
      .start_file(name, options)
      .map_err(|e| e.to_string())?;
    let mut buf = Vec::new();
    File::open(path)
      .map_err(|e| e.to_string())?
      .read_to_end(&mut buf)
      .map_err(|e| e.to_string())?;
    zip.write_all(&buf).map_err(|e| e.to_string())?;
  }
  Ok(())
}

/// Zips a staging db snapshot (already produced via `VACUUM INTO` by the
/// caller) plus the attachments/covers folders into `dest_zip_path`.
#[tauri::command]
pub async fn export_backup(
  app: AppHandle,
  staging_db_path: String,
  dest_zip_path: String,
) -> Result<(), String> {
  let local_dir = app.path().app_local_data_dir().map_err(|e| e.to_string())?;

  let file = File::create(&dest_zip_path).map_err(|e| e.to_string())?;
  let mut zip = ZipWriter::new(file);
  let options = SimpleFileOptions::default().compression_method(CompressionMethod::Deflated);

  zip
    .start_file(DB_FILENAME, options)
    .map_err(|e| e.to_string())?;
  let mut db_bytes = Vec::new();
  File::open(&staging_db_path)
    .map_err(|e| e.to_string())?
    .read_to_end(&mut db_bytes)
    .map_err(|e| e.to_string())?;
  zip.write_all(&db_bytes).map_err(|e| e.to_string())?;

  add_dir_to_zip(&mut zip, &local_dir.join("attachments"), "attachments")?;
  add_dir_to_zip(&mut zip, &local_dir.join("covers"), "covers")?;

  zip.finish().map_err(|e| e.to_string())?;
  let _ = fs::remove_file(&staging_db_path);
  Ok(())
}

/// Unpacks `src_zip_path` into `*.pending` siblings of the live db file
/// and attachments/covers folders. Does not touch the live files — call
/// `relaunch()` from the frontend afterwards so `apply_pending_restore`
/// can swap them in on the next clean start.
#[tauri::command]
pub async fn import_backup(app: AppHandle, src_zip_path: String) -> Result<(), String> {
  let config_dir = app.path().app_config_dir().map_err(|e| e.to_string())?;
  let local_dir = app.path().app_local_data_dir().map_err(|e| e.to_string())?;

  let file = File::open(&src_zip_path).map_err(|e| e.to_string())?;
  let mut archive = ZipArchive::new(file).map_err(|e| e.to_string())?;

  if archive.by_name(DB_FILENAME).is_err() {
    return Err("invalid_backup".into());
  }

  let attachments_pending = local_dir.join("attachments.pending");
  let covers_pending = local_dir.join("covers.pending");
  let db_pending = config_dir.join(format!("{DB_FILENAME}.pending"));
  let _ = fs::remove_dir_all(&attachments_pending);
  let _ = fs::remove_dir_all(&covers_pending);
  let _ = fs::remove_file(&db_pending);

  for i in 0..archive.len() {
    let mut entry = archive.by_index(i).map_err(|e| e.to_string())?;
    let Some(enclosed) = entry.enclosed_name() else { continue };
    let name = enclosed.to_string_lossy().replace('\\', "/");

    let dest: PathBuf = if name == DB_FILENAME {
      db_pending.clone()
    } else if let Some(rel) = name.strip_prefix("attachments/") {
      attachments_pending.join(rel)
    } else if let Some(rel) = name.strip_prefix("covers/") {
      covers_pending.join(rel)
    } else {
      continue;
    };

    if entry.is_dir() {
      fs::create_dir_all(&dest).map_err(|e| e.to_string())?;
      continue;
    }
    if let Some(parent) = dest.parent() {
      fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let mut out = File::create(&dest).map_err(|e| e.to_string())?;
    std::io::copy(&mut entry, &mut out).map_err(|e| e.to_string())?;
  }

  Ok(())
}

/// Runs on every startup, before the frontend loads. A no-op unless a
/// restore is pending (one `Path::exists()` check per candidate).
pub fn apply_pending_restore(app: &AppHandle) {
  let Ok(config_dir) = app.path().app_config_dir() else { return };
  let Ok(local_dir) = app.path().app_local_data_dir() else { return };

  let db_pending = config_dir.join(format!("{DB_FILENAME}.pending"));
  if db_pending.exists() {
    let _ = fs::remove_file(config_dir.join(DB_FILENAME));
    let _ = fs::rename(&db_pending, config_dir.join(DB_FILENAME));
  }
  for name in ["attachments", "covers"] {
    let pending = local_dir.join(format!("{name}.pending"));
    if pending.exists() {
      let live = local_dir.join(name);
      let _ = fs::remove_dir_all(&live);
      let _ = fs::rename(&pending, &live);
    }
  }
}
