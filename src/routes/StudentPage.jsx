import React, { useState } from 'react';
import { submitWord } from '../lib/realtime';
import { validateWord } from '../lib/wordUtils';

function StudentPage() {
  const [word, setWord] = useState('');
  const [message, setMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const value = e.target.value;
    // 只允许输入英文字符
    if (/^[A-Za-z]*$/.test(value) && value.length <= 15) {
      setWord(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validateWord(word);
    if (!validation.valid) {
      setMessage({ type: 'error', text: validation.message });
      return;
    }

    setIsSubmitting(true);
    try {
      await submitWord(word);
      setMessage({ type: 'success', text: 'Submitted successfully.' });
      setWord('');
    } catch (error) {
      setMessage({ type: 'error', text: 'Submission failed. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="student-page">
      <h1>💝 HeartCloud Live</h1>
      <p className="subtitle">Enter your word to join the word cloud</p>

      <form className="input-container" onSubmit={handleSubmit}>
        <input
          type="text"
          className="word-input"
          value={word}
          onChange={handleInputChange}
          placeholder="Enter English word"
          maxLength={15}
          autoComplete="off"
          autoFocus
        />
        <button
          type="submit"
          className="submit-btn"
          disabled={isSubmitting || !word.trim()}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
    </div>
  );
}

export default StudentPage;
