import React, { useState } from 'react';
import { submitWord } from '../lib/realtime';
import { sanitizeChineseInput, validateWord } from '../lib/wordUtils';

function StudentPage() {
  const [word, setWord] = useState('');
  const [message, setMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComposing, setIsComposing] = useState(false);

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (isComposing || e.nativeEvent.isComposing) {
      setWord(value);
      return;
    }

    setWord(sanitizeChineseInput(value));
  };

  const handleCompositionEnd = (e) => {
    setIsComposing(false);
    setWord(sanitizeChineseInput(e.target.value));
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
      setMessage({ type: 'success', text: '提交成功。' });
      setWord('');
    } catch (error) {
      setMessage({ type: 'error', text: error.message || '提交失败，请重试。' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="student-page">
      <p className="subtitle">请在空格中输入你的答案</p>

      <form className="input-container" onSubmit={handleSubmit}>
        <input
          type="text"
          className="word-input"
          value={word}
          onChange={handleInputChange}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={handleCompositionEnd}
          placeholder="请输入中文词语"
          maxLength={15}
          autoComplete="off"
          autoFocus
        />
        <button
          type="submit"
          className="submit-btn"
          disabled={isSubmitting || !word.trim()}
        >
          {isSubmitting ? '提交中...' : '提交'}
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
