/**
 * Client-side image validation and pre-analysis checks.
 */

export function validateImageFile(file) {
  if (!file) {
    return { isValid: false, error: "No file was selected." };
  }

  const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (!validTypes.includes(file.type.toLowerCase())) {
    return {
      isValid: false,
      error: "Please select a valid image format (JPEG, PNG, or WEBP)."
    };
  }

  // 15 MB limit
  const maxBytes = 15 * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      isValid: false,
      error: "Image file exceeds 15 MB. Please select a smaller photo."
    };
  }

  return { isValid: true, error: null };
}

export function quickClientLightingCheck(imgElement) {
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const w = Math.min(imgElement.naturalWidth || imgElement.width, 200);
    const h = Math.min(imgElement.naturalHeight || imgElement.height, 200);
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(imgElement, 0, 0, w, h);

    const imgData = ctx.getImageData(0, 0, w, h).data;
    let totalLum = 0;
    const pixelCount = w * h;

    for (let i = 0; i < imgData.length; i += 4) {
      const r = imgData[i];
      const g = imgData[i + 1];
      const b = imgData[i + 2];
      totalLum += 0.299 * r + 0.587 * g + 0.114 * b;
    }

    const avgLum = totalLum / pixelCount;

    if (avgLum < 45) {
      return {
        status: "dark",
        score: Math.round(avgLum),
        warning: "Low ambient lighting detected. Photos taken in natural daylight yield highest color harmony accuracy."
      };
    } else if (avgLum > 225) {
      return {
        status: "overexposed",
        score: Math.round(avgLum),
        warning: "Image appears very bright with direct flash or intense glare."
      };
    } else if (avgLum < 75) {
      return {
        status: "dim",
        score: Math.round(avgLum),
        warning: "Lighting is slightly dim. Still analyzable, but softer daylight is ideal."
      };
    }

    return {
      status: "optimal",
      score: Math.round(avgLum),
      warning: null
    };
  } catch (e) {
    return { status: "unknown", score: 100, warning: null };
  }
}
