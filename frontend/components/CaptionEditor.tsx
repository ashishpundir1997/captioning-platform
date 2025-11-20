import { useState } from 'react';
import { Caption } from '@/lib/constants';

interface CaptionEditorProps {
  captions: Caption[];
  onUpdate: (captions: Caption[]) => void;
}

export default function CaptionEditor({ captions, onUpdate }: CaptionEditorProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  const handleEdit = (caption: Caption) => {
    setEditingId(caption.id);
    setEditText(caption.text);
  };

  const handleSave = () => {
    if (editingId === null) return;

    const updatedCaptions = captions.map((caption) =>
      caption.id === editingId ? { ...caption, text: editText } : caption
    );

    onUpdate(updatedCaptions);
    setEditingId(null);
    setEditText('');
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleDelete = (id: number) => {
    const updatedCaptions = captions.filter((caption) => caption.id !== id);
    onUpdate(updatedCaptions);
  };

  return (
    <div className="caption-editor">
      <div className="captions-list">
        {captions.map((caption) => (
          <div key={caption.id} className="caption-item">
            <div className="caption-time">
              {caption.start.toFixed(2)}s - {caption.end.toFixed(2)}s
            </div>
            
            {editingId === caption.id ? (
              <div className="caption-edit">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="caption-textarea"
                  rows={2}
                />
                <div className="edit-actions">
                  <button onClick={handleSave} className="btn-save">
                    Save
                  </button>
                  <button onClick={handleCancel} className="btn-cancel">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="caption-display">
                <p className="caption-text">{caption.text}</p>
                <div className="caption-actions">
                  <button
                    onClick={() => handleEdit(caption)}
                    className="btn-icon"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(caption.id)}
                    className="btn-icon"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
