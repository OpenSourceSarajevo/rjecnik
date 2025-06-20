import React, { useState } from 'react';
import { Edit, Save, X, ChevronDown, ChevronUp } from 'lucide-react';
import styles from './WordCard.module.css';
import { Word } from '@/app/api/dictionary/route';

interface WordCardProps {
	word: Word;
	updateWord: (id: number, updatedWord: Word) => void;
}

const WordCard: React.FC<WordCardProps> = ({ word, updateWord }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [editedWord, setEditedWord] = useState<Word>(word);

  const handleEdit = () => {
    setIsEditing(true);
    setIsExpanded(true);
  };
  const handleCancel = () => {
    setIsEditing(false);
    setEditedWord(word);
  };
  const handleSave = () => {
    updateWord(word.id, editedWord);
    setIsEditing(false);
  };

  const handleHeadwordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedWord({ ...editedWord, headword: e.target.value });
  };
  
  const handleDefinitionChange = (defIndex: number, field: string, value: string) => {
    const newDefinitions = [...editedWord.definitions];
    const def = newDefinitions[defIndex];
    switch (field) {
        case 'definition': def.definition = value; break;
        case 'part_of_speech': def.part_of_speech = value; break;
        case 'gender': def.gender = value; break;
        case 'type': def.type = value; break;
        case 'pronunciation_ipa': def.pronunciation_ipa = value; break;
        case 'pronunciation_audio': def.pronunciation_audio = value; break;
    }
    setEditedWord({ ...editedWord, definitions: newDefinitions });
  };

  const handleExampleChange = (defIndex: number, exIndex: number, value: string) => {
    const newDefinitions = [...editedWord.definitions];
    if(newDefinitions[defIndex].examples) {
        newDefinitions[defIndex].examples![exIndex] = value;
        setEditedWord({ ...editedWord, definitions: newDefinitions });
    }
  };

  const addExample = (defIndex: number) => {
    const newDefinitions = [...editedWord.definitions];
    if(newDefinitions[defIndex].examples) {
        newDefinitions[defIndex].examples!.push('');
    } else {
        newDefinitions[defIndex].examples = [''];
    }
    setEditedWord({ ...editedWord, definitions: newDefinitions });
  };

  const removeExample = (defIndex: number, exIndex: number) => {
    const newDefinitions = [...editedWord.definitions];
    if(newDefinitions[defIndex].examples) {
        newDefinitions[defIndex].examples!.splice(exIndex, 1);
        setEditedWord({ ...editedWord, definitions: newDefinitions });
    }
  };

  return (
    <div className={styles.container}>
      <div 
        className={styles.header}
        onClick={() => !isEditing && setIsExpanded(!isExpanded)}
      >
        <div className={styles.wordInfo}>
          <div className={styles.wordTitle}>
            <h3 className={styles.word}>{word.headword}</h3>
            <span className={styles.partOfSpeech}>
              {word.definitions.map(d => d.part_of_speech).join(', ')}
            </span>
          </div>
          {!isExpanded && (
            <p className={`${styles.shortDefinition} line-clamp-1`}>{word.definitions[0].definition}</p>
          )}
        </div>
        
        <div className={styles.actions}>
          {!isEditing && (
            <>
              <button onClick={(e) => { e.stopPropagation(); handleEdit(); }} className={`${styles.actionButton} ${styles.editButton}`}><Edit size={18} /></button>
            </>
          )}
          <button onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }} className={`${styles.actionButton} ${styles.expandButton}`}>{isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</button>
        </div>
      </div>
      
      {isExpanded && (
        <div className={styles.content}>
          {isEditing ? (
            <div className={styles.editForm}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Riječ</label>
                <input type="text" value={editedWord.headword} onChange={handleHeadwordChange} className={styles.input}/>
              </div>

              {editedWord.definitions.map((def, defIndex) => (
                <div key={defIndex} className={styles.definitionBox}>
                  <div className={`${styles.grid} ${styles.gridTwoColumns}`}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>Definicija</label>
                      <textarea value={def.definition} onChange={(e) => handleDefinitionChange(defIndex, 'definition', e.target.value)} rows={3} className={`${styles.input} ${styles.textarea}`}/>
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>Vrsta riječi</label>
                      <select value={def.part_of_speech ?? ''} onChange={(e) => handleDefinitionChange(defIndex, 'part_of_speech', e.target.value)} className={styles.select}>
                        <option value="imenica">Imenica</option>
                        <option value="glagol">Glagol</option>
                        <option value="pridjev">Pridjev</option>
                      </select>
                    </div>
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>Primjeri</label>
                    {(def.examples ?? []).map((example, exIndex) => (
                      <div key={exIndex} className={styles.exampleField}>
                        <input type="text" value={example} onChange={(e) => handleExampleChange(defIndex, exIndex, e.target.value)} className={styles.exampleInput}/>
                        <button onClick={() => removeExample(defIndex, exIndex)} className={styles.removeButton}><X size={16} /></button>
                      </div>
                    ))}
                    <button onClick={() => addExample(defIndex)} className={styles.addButton}>+ Dodaj primjer</button>
                  </div>
                </div>
              ))}
              
              <div className={styles.formActions}>
                <button onClick={handleCancel} className={styles.cancelButton}><X size={16} style={{ marginRight: 'var(--spacing-1)' }} /> Otkaži</button>
                <button onClick={handleSave} className={styles.saveButton}><Save size={16} style={{ marginRight: 'var(--spacing-1)' }} /> Sačuvaj</button>
              </div>
            </div>
          ) : (
            <div className={styles.viewContent}>
              {word.definitions.map((def, index) => (
                <div key={index} className={styles.definitionSection}>
                  <div className={styles.sectionHeader}>
                    <h4 className={styles.sectionTitle}>{def.part_of_speech}</h4>
                    {def.gender && <span className={styles.gender}>({def.gender})</span>}
                  </div>
                  <p className={styles.definition}>{def.definition}</p>
                  
                  {def.examples && def.examples.length > 0 && (
                      <div className={styles.section}>
                      <h5 className={styles.subSectionTitle}>Primjeri</h5>
                      <ul className={styles.examplesList}>
                        {def.examples.map((example, index) => (
                          <li key={index} className={styles.exampleItem}>{example}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WordCard; 