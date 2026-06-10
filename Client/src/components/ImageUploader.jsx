import { useState, useRef } from "react";
import { useRecipe } from "../context/RecipeContext";
import MultiStageLoader from "./MultiStageLoader";
import ManualIngredientEntry from "./ManualIngredientEntry";

function ImageUploader() {
  const [preview, setPreview]         = useState(null);
  const [dragActive, setDragActive]   = useState(false);
  const [useManualEntry, setUseManualEntry] = useState(false);
  const [localError, setLocalError]   = useState(null);
  const fileInputRef                  = useRef(null);
  const { analyzeImage, loading, error, setError, setUploadedImage } = useRecipe();

  const handleFile = (file) => {
    if (!file) return;
    
    setLocalError(null);
    
    if (!file.type.startsWith("image/")) {
      setLocalError("Please upload a valid image file (PNG, JPG, WebP, etc.)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setLocalError("Image size must be less than 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
      setUploadedImage(e.target.result);
    };
    reader.readAsDataURL(file);

    analyzeImage(file).catch(() => {
      // Error is already handled in context
    });
  };

  const handleDrop       = (e) => { e.preventDefault(); setDragActive(false); handleFile(e.dataTransfer.files[0]); };
  const handleDragOver   = (e) => { e.preventDefault(); setDragActive(true); };
  const handleDragLeave  = ()  => setDragActive(false);
  const handleInputChange = (e) => handleFile(e.target.files[0]);
  const handleClick      = ()  => fileInputRef.current?.click();

  const resetImageUpload = () => {
    setPreview(null);
    setLocalError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleMode = () => {
    setUseManualEntry(!useManualEntry);
    resetImageUpload();
    setError(null);
  };

  const displayError = localError || error;

  if (useManualEntry) {
    return (
      <div className="ingredient-entry-container">
        <div className="mode-toggle">
          <button className="toggle-mode-btn" onClick={toggleMode}>
            ← Back to Image Upload
          </button>
        </div>
        <ManualIngredientEntry />
      </div>
    );
  }

  return (
    <div className="image-uploader">
      <div className="uploader-header">
        <h2>Upload Food Photo</h2>
        <button className="manual-entry-toggle" onClick={toggleMode} title="Or enter ingredients manually">
          Type Manually Instead →
        </button>
      </div>
      <p className="uploader-subtitle">
        Take a photo of ingredients in your fridge or a dish you want to recreate
      </p>

      {displayError && (
        <div className="error-banner">
          <div className="error-icon">⚠️</div>
          <div className="error-content">
            <p className="error-title">Upload Failed</p>
            <p className="error-message">{displayError}</p>
          </div>
          <button
            className="error-close-btn"
            onClick={() => {
              setLocalError(null);
              setError(null);
            }}
          >
            ✕
          </button>
        </div>
      )}

      <div
        className={`drop-zone ${dragActive ? "drag-active" : ""} ${preview && !displayError ? "has-preview" : ""}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        {preview && !displayError ? (
          <>
            <img src={preview} alt="Uploaded food" className="preview-image" />
            <div className="preview-overlay">
              <button className="change-image-btn" onClick={(e) => { e.stopPropagation(); resetImageUpload(); }}>
                Change Image
              </button>
            </div>
          </>
        ) : (
          <div className="drop-zone-content">
            <span className="upload-icon">📸</span>
            <p>Drag & drop your food photo here</p>
            <p className="or-text">or click to browse</p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="file-input"
        />
      </div>

      {loading && <MultiStageLoader />}
    </div>
  );
}

export default ImageUploader;
    