'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';

interface Note {
  id: string;
  reference: string;
  text: string;
  date: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newReference, setNewReference] = useState('');
  const [newText, setNewText] = useState('');

  useEffect(() => {
    // Load notes from localStorage on mount
    const savedNotes = localStorage.getItem('study-bible-notes');
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (e) {
        console.error('Failed to parse notes');
      }
    }
  }, []);

  const saveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReference || !newText) return;

    const newNote: Note = {
      id: Date.now().toString(),
      reference: newReference,
      text: newText,
      date: new Date().toISOString().split('T')[0],
    };

    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    localStorage.setItem('study-bible-notes', JSON.stringify(updatedNotes));
    
    setNewReference('');
    setNewText('');
  };

  const deleteNote = (id: string) => {
    const updatedNotes = notes.filter(n => n.id !== id);
    setNotes(updatedNotes);
    localStorage.setItem('study-bible-notes', JSON.stringify(updatedNotes));
  };

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>My Study Notes</h1>
      <p className={styles.subtitle}>Your personal reflections, securely saved on your device.</p>

      <form className={styles.form} onSubmit={saveNote}>
        <input 
          type="text" 
          placeholder="Scripture Reference (e.g. John 3:16)" 
          className={styles.input}
          value={newReference}
          onChange={e => setNewReference(e.target.value)}
          required
        />
        <textarea 
          placeholder="Write your study notes here..." 
          className={styles.textarea}
          value={newText}
          onChange={e => setNewText(e.target.value)}
          required
          rows={4}
        />
        <button type="submit" className={styles.button}>Save Note</button>
      </form>

      <div className={styles.notesGrid}>
        {notes.length === 0 ? (
          <p className={styles.empty}>No notes yet. Start writing your reflections above!</p>
        ) : (
          notes.map(note => (
            <div key={note.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardReference}>{note.reference}</h3>
                <span className={styles.cardDate}>{note.date}</span>
              </div>
              <p className={styles.cardText}>{note.text}</p>
              <button onClick={() => deleteNote(note.id)} className={styles.deleteBtn}>Delete</button>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
