import React, { useState, useEffect, useRef, useCallback } from 'react';
import HeartWordCloud from '../components/HeartWordCloud';
import {
  wsClient,
  fetchActivePage,
  fetchPages,
  fetchSubmissions,
  createNewPage,
  switchPage,
  clearPage
} from '../lib/realtime';
import { calculateWordFrequency } from '../lib/wordUtils';

function ScreenPage() {
  const [activePageId, setActivePageId] = useState(null);
  const [pages, setPages] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [wordCloudData, setWordCloudData] = useState([]);

  const activePageIdRef = useRef(null);
  const submissionsRef = useRef([]);

  useEffect(() => {
    activePageIdRef.current = activePageId;
  }, [activePageId]);

  useEffect(() => {
    submissionsRef.current = submissions;
  }, [submissions]);

  const handleNewSubmission = useCallback((submission) => {
    if (submission.page_id === activePageIdRef.current) {
      setSubmissions(prev => [...prev, submission]);
    }
  }, []);

  const handlePageChanged = useCallback((data) => {
    setActivePageId(data.active_page_id);
    if (data.page) {
      setPages(prev => {
        if (prev.find(p => p.id === data.page.id)) return prev;
        return [...prev, data.page];
      });
    }
    fetchSubmissions(data.active_page_id).then(submissionsRes => {
      setSubmissions(submissionsRes);
    });
  }, []);

  const handleInit = useCallback((data) => {
    setActivePageId(data.active_page_id);
    setPages(data.pages);
    if (data.active_page_id) {
      fetchSubmissions(data.active_page_id).then(submissionsRes => {
        setSubmissions(submissionsRes);
      });
    }
  }, []);

  const handlePageCleared = useCallback((data) => {
    if (data.page_id === activePageIdRef.current) {
      setSubmissions([]);
    }
  }, []);

  useEffect(() => {
    const initData = async () => {
      try {
        const [activePageRes, pagesRes] = await Promise.all([
          fetchActivePage(),
          fetchPages()
        ]);

        setActivePageId(activePageRes.active_page_id);
        setPages(pagesRes);

        if (activePageRes.active_page_id) {
          const submissionsRes = await fetchSubmissions(activePageRes.active_page_id);
          setSubmissions(submissionsRes);
        }
      } catch (error) {
        console.error('Failed to initialize data:', error);
      }
    };

    initData();

    wsClient.connect();

    wsClient.on('new_submission', handleNewSubmission);
    wsClient.on('page_changed', handlePageChanged);
    wsClient.on('init', handleInit);
    wsClient.on('page_cleared', handlePageCleared);

    return () => {
      wsClient.off('new_submission', handleNewSubmission);
      wsClient.off('page_changed', handlePageChanged);
      wsClient.off('init', handleInit);
      wsClient.off('page_cleared', handlePageCleared);
    };
  }, []);

  useEffect(() => {
    if (activePageId) {
      fetchSubmissions(activePageId).then(submissionsRes => {
        setSubmissions(submissionsRes);
      });
    }
  }, [activePageId]);

  useEffect(() => {
    setWordCloudData(calculateWordFrequency(submissions));
  }, [submissions]);

  const handleNewPage = async () => {
    try {
      await createNewPage();
    } catch (error) {
      console.error('Failed to create new page:', error);
    }
  };

  const handleSwitchPage = async (pageId) => {
    try {
      await switchPage(pageId);
    } catch (error) {
      console.error('Failed to switch page:', error);
    }
  };

  const handleClearPage = async () => {
    try {
      await clearPage();
    } catch (error) {
      console.error('Failed to clear page:', error);
    }
  };

  const activePage = pages.find(p => p.id === activePageId);
  const totalSubmissions = submissions.length;
  const uniqueWords = new Set(submissions.map(s => s.word)).size;

  return (
    <div className="screen-page">
      <div className="screen-header">
        <h1 className="screen-title">💝 HeartCloud Live</h1>

        <div className="screen-stats">
          <div className="stat-item">
            <div className="stat-label">Current Page</div>
            <div className="stat-value">Page {activePage?.page_no || 1}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Total Submissions</div>
            <div className="stat-value">{totalSubmissions}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Unique Words</div>
            <div className="stat-value">{uniqueWords}</div>
          </div>
        </div>

        <div className="screen-actions">
          <button className="new-page-btn" onClick={handleNewPage}>
            + New Page
          </button>
          <button className="clear-btn" onClick={handleClearPage}>
            Clear
          </button>
        </div>
      </div>

      <div className="page-tabs">
        {pages.map(page => (
          <button
            key={page.id}
            className={`page-tab ${page.id === activePageId ? 'active' : ''}`}
            onClick={() => handleSwitchPage(page.id)}
          >
            Page {page.page_no}
          </button>
        ))}
      </div>

      <div className="wordcloud-container">
        {wordCloudData.length > 0 ? (
          <HeartWordCloud data={wordCloudData} />
        ) : (
          <div className="wordcloud-empty">
            Waiting for submissions...
          </div>
        )}
      </div>
    </div>
  );
}

export default ScreenPage;
