"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { User, Shield, Check, AlertCircle, Save, Trash2, Edit } from "lucide-react";

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [signatureUrl, setSignatureUrl] = useState("");
  
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
      setAvatarUrl(user.avatar_url || "");
      setSignatureUrl(user.signature_url || "");
    }
  }, [user]);

  // Canvas drawing functions (Mouse & Touch supported)
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX = 0;
    let clientY = 0;

    if ("touches" in e) {
      if (e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#0f172a"; // dark slate signature color
    
    const coords = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const coords = getCoordinates(e);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveCanvasSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Check if canvas is blank
    const blank = document.createElement("canvas");
    blank.width = canvas.width;
    blank.height = canvas.height;
    if (canvas.toDataURL() === blank.toDataURL()) {
      alert("Please draw your signature first.");
      return;
    }
    
    const dataUrl = canvas.toDataURL("image/png");
    setSignatureUrl(dataUrl);
    setMessage("Signature canvas captured. Click 'Save Profile' to submit changes.");
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    
    try {
      const res = await fetch("/api/v1/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: fullName,
          avatar_url: avatarUrl || null,
          signature_url: signatureUrl || null
        })
      });
      
      if (res.ok) {
        setMessage("Profile settings updated successfully.");
        // Refresh local cache via background sync or window reload if authContext allows
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        const body = await res.json().catch(() => ({}));
        setError(body.detail || "Failed to update profile.");
      }
    } catch {
      setError("Network error updating profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: "2.5rem", maxWidth: "48rem", margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: "2rem" }}>
      
      <div>
        <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)" }}>Profile Settings</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
          Update your platform identity credentials and signatures for completing/completing documents.
        </p>
      </div>

      {message && (
        <div style={{ padding: "1rem", background: "rgba(16, 185, 129, 0.08)", border: "1px solid var(--accent-emerald)", borderRadius: "8px", color: "var(--accent-emerald)", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem" }}>
          <Check size={18} />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div style={{ padding: "1rem", background: "rgba(239, 68, 68, 0.08)", border: "1px solid var(--accent-rose)", borderRadius: "8px", color: "var(--accent-rose)", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem" }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSaveProfile} style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "2.5rem", boxShadow: "var(--shadow-sm)", display: "flex", flexDirection: "column", gap: "1.75rem" }}>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)" }}>Full Name</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1px solid var(--border-color)", borderRadius: "8px", fontSize: "0.95rem" }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)" }}>Avatar Image URL (Optional)</label>
          <input
            type="text"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1px solid var(--border-color)", borderRadius: "8px", fontSize: "0.95rem" }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <label style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)" }}>Instructor / Graduation Signature</label>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
            Draw your signature directly in the canvas below or input/upload an image URL manually.
          </p>

          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
            
            {/* Draw Signature Canvas */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>Option A: Draw Signature</div>
              <canvas
                ref={canvasRef}
                width={360}
                height={160}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                onTouchCancel={stopDrawing}
                style={{
                  border: "2px dashed var(--border-color)",
                  borderRadius: "8px",
                  background: "var(--bg-secondary)",
                  cursor: "crosshair",
                  touchAction: "none",
                  maxWidth: "100%"
                }}
              />
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="button"
                  onClick={clearCanvas}
                  style={{
                    padding: "0.35rem 0.75rem", fontSize: "0.8rem", background: "none", border: "1px solid var(--border-color)",
                    borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem"
                  }}
                >
                  <Trash2 size={14} /> Clear
                </button>
                <button
                  type="button"
                  onClick={saveCanvasSignature}
                  style={{
                    padding: "0.35rem 0.75rem", fontSize: "0.8rem", background: "var(--accent-violet)", border: "none",
                    color: "white", borderRadius: "6px", cursor: "pointer", fontWeight: 600
                  }}
                >
                  Capture Drawing
                </button>
              </div>
            </div>

            {/* Signature URL / Preview */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", flex: 1, minWidth: "15rem" }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)" }}>Option B: Signature Image URL</div>
              <input
                type="text"
                placeholder="https://example.com/signature.png"
                value={signatureUrl}
                onChange={(e) => setSignatureUrl(e.target.value)}
                style={{ width: "100%", padding: "0.65rem 0.85rem", border: "1px solid var(--border-color)", borderRadius: "8px", fontSize: "0.9rem" }}
              />

              <div style={{ marginTop: "0.5rem" }}>
                <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.35rem" }}>Active Signature Preview:</div>
                <div style={{ width: "100%", height: "5.5rem", border: "1px solid var(--border-color)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-secondary)", overflow: "hidden" }}>
                  {signatureUrl ? (
                    <img src={signatureUrl} alt="Signature Preview" style={{ maxHeight: "4.5rem", maxWidth: "90%", objectFit: "contain" }} />
                  ) : (
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>No signature uploaded or drawn yet</span>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>

        <div style={{ marginTop: "1rem", borderTop: "1px solid var(--border-color)", paddingTop: "1.5rem", display: "flex", justifyContent: "flex-end" }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              background: "var(--text-primary)", color: "white", border: "none",
              padding: "0.75rem 1.75rem", borderRadius: "8px", fontSize: "0.95rem",
              fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "0.5rem"
            }}
          >
            <Save size={18} /> {saving ? "Saving Changes..." : "Save Profile"}
          </button>
        </div>

      </form>

    </div>
  );
}
