import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import styles from './AddWordForm.module.css';
import { Word } from '@/app/api/dictionary/route';

interface AddWordFormProps {
    addWord: (newWord: Omit<Word, 'id'>) => void;
}

const AddWordForm: React.FC<AddWordFormProps> = ({ addWord }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [headword, setHeadword] = useState('');
  const [definitions, setDefinitions] = useState([{
    definition: '',
    part_of_speech: 'imenica',
    gender: 'm',
    examples: [''],
    type: '',
    pronunciation_ipa: '',
    pronunciation_audio: ''
  }]);

  const handleDefinitionChange = (index: number, field: string, value: string) => {
    const newDefinitions = [...definitions];
    const def = newDefinitions[index];
    switch (field) {
        case 'definition': def.definition = value; break;
        case 'part_of_speech': def.part_of_speech = value; break;
        case 'gender': def.gender = value; break;
        case 'type': def.type = value; break;
        case 'pronunciation_ipa': def.pronunciation_ipa = value; break;
        case 'pronunciation_audio': def.pronunciation_audio = value; break;
    }
    setDefinitions(newDefinitions);
  };

  const handleExampleChange = (defIndex: number, exIndex: number, value: string) => {
    const newDefinitions = [...definitions];
    newDefinitions[defIndex].examples[exIndex] = value;
    setDefinitions(newDefinitions);
  };

  const addExample = (defIndex: number) => {
    const newDefinitions = [...definitions];
    newDefinitions[defIndex].examples.push('');
    setDefinitions(newDefinitions);
  };

  const removeExample = (defIndex: number, exIndex: number) => {
    const newDefinitions = [...definitions];
    newDefinitions[defIndex].examples.splice(exIndex, 1);
    setDefinitions(newDefinitions);
  };

  const addDefinition = () => {
    setDefinitions([...definitions, {
        definition: '',
        part_of_speech: 'imenica',
        gender: 'm',
        examples: [''],
        type: '',
        pronunciation_ipa: '',
        pronunciation_audio: ''
    }]);
  };

  const removeDefinition = (index: number) => {
    const newDefinitions = definitions.filter((_, i) => i !== index);
    setDefinitions(newDefinitions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const processedDefinitions = definitions.map(def => ({
        ...def,
        examples: def.examples.filter(ex => ex.trim() !== ''),
    }));

    addWord({
      headword,
      definitions: processedDefinitions,
    });
    
    // Reset form
    setHeadword('');
    setDefinitions([{
        definition: '',
        part_of_speech: 'imenica',
        gender: 'm',
        examples: [''],
        type: '',
        pronunciation_ipa: '',
        pronunciation_audio: ''
    }]);
    setIsFormOpen(false);
  };

  return (
    <div className={styles.container}>
      <div 
        className={styles.header}
        onClick={() => setIsFormOpen(!isFormOpen)}
      >
        <h3 className={styles.title}>Dodaj Novu Riječ</h3>
        <button className={styles.toggleButton}>
          {isFormOpen ? <X size={20} /> : <Plus size={20} />}
        </button>
      </div>
      
      {isFormOpen && (
        <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Riječ</label>
              <input
                type="text"
                value={headword}
                onChange={(e) => setHeadword(e.target.value)}
                required
                className={styles.input}
              />
            </div>

            {definitions.map((def, defIndex) => (
                <div key={defIndex} className={styles.definitionBox}>
                    <div className={`${styles.grid} ${styles.gridTwoColumns}`}>
                        <div className={styles.fieldGroup}>
                        <label className={styles.label}>Definicija</label>
                        <textarea
                            value={def.definition}
                            onChange={(e) => handleDefinitionChange(defIndex, 'definition', e.target.value)}
                            required
                            rows={3}
                            className={`${styles.input} ${styles.textarea}`}
                        />
                        </div>
                        <div className={styles.fieldGroup}>
                        <label className={styles.label}>Vrsta riječi</label>
                        <select
                            value={def.part_of_speech ?? ''}
                            onChange={(e) => handleDefinitionChange(defIndex, 'part_of_speech', e.target.value)}
                            className={styles.select}
                        >
                            <option value="imenica">Imenica</option>
                            <option value="glagol">Glagol</option>
                            <option value="pridjev">Pridjev</option>
                            <option value="prilog">Prilog</option>
                            <option value="zamjenica">Zamjenica</option>
                            <option value="prijedlog">Prijedlog</option>
                            <option value="veznik">Veznik</option>
                            <option value="uzvik">Uzvici</option>
                        </select>
                        </div>
                    </div>
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Primjeri</label>
                        {def.examples.map((example, exIndex) => (
                        <div key={exIndex} className={styles.dynamicField}>
                            <input
                            type="text"
                            value={example}
                            onChange={(e) => handleExampleChange(defIndex, exIndex, e.target.value)}
                            placeholder="Primjer upotrebe"
                            className={styles.dynamicInput}
                            />
                            <button
                            type="button"
                            onClick={() => removeExample(defIndex, exIndex)}
                            className={styles.removeButton}
                            >
                            <X size={16} />
                            </button>
                        </div>
                        ))}
                        <button
                        type="button"
                        onClick={() => addExample(defIndex)}
                        className={styles.addButton}
                        >
                        + Dodaj primjer
                        </button>
                    </div>
                     {defIndex > 0 && (
                        <button type="button" onClick={() => removeDefinition(defIndex)} className={styles.removeDefinitionButton}>
                            Ukloni Definiciju
                        </button>
                    )}
                </div>
            ))}

            <button type="button" onClick={addDefinition} className={styles.addDefinitionButton}>
                + Dodaj Definiciju
            </button>
          
          <div className={styles.actions}>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className={styles.cancelButton}
            >
              Otkaži
            </button>
            <button
              type="submit"
              className={styles.submitButton}
            >
              Dodaj Riječ
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddWordForm; 