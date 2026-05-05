import { useState, useEffect, useCallback, useRef } from 'react';
import {
  createEmail, restoreSession, getMessages, getMessage, getDomains
} from '../lib/api';
import {
  saveSession, loadSession, clearSession, extendSession,
  isExpired, timeLeft, TEN_MINUTES,
  loadSessionList, saveSessionList
} from '../lib/session';
import { playNewMailSound, playExpireSound } from '../lib/sounds';

export function useEmail() {
  const [sessionsList, setSessionsList] = useState([]);
  const [domains, setDomains]           = useState([]);
  const [pollInterval, setPollInterval] = useState(2500);

  const [session, setSession]           = useState(null);
  const [messages, setMessages]         = useState([]);
  const [selectedMsg, setSelectedMsg]   = useState(null);
  const [msgContent, setMsgContent]     = useState(null);
  const [loading, setLoading]           = useState(true);
  const [generating, setGenerating]     = useState(false);
  const [msgLoading, setMsgLoading]     = useState(false);
  const [error, setError]               = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(TEN_MINUTES);
  const [expired, setExpired]           = useState(false);
  const [unreadCount, setUnreadCount]   = useState(0);
  const [newMailIds, setNewMailIds]     = useState(new Set());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [totalReceived, setTotalReceived] = useState(0);
  const [pollStatus, setPollStatus]     = useState('idle');
  const [sessionCreatedAt, setSessionCreatedAt] = useState(null);

  const seenIds  = useRef(new Set());
  const pollRef  = useRef(null);
  const timerRef = useRef(null);
  const soundRef = useRef(true);
  const pollIntervalRef = useRef(pollInterval);

  useEffect(() => { soundRef.current = soundEnabled; }, [soundEnabled]);
  useEffect(() => { pollIntervalRef.current = pollInterval; }, [pollInterval]);

  // Load domains on mount
  useEffect(() => {
    getDomains().then(res => setDomains(res.domains || [])).catch(() => {});
  }, []);

  // Update session list safely
  const _updateSessions = (sess) => {
    setSessionsList(prev => {
      const idx = prev.findIndex(s => s.address === sess.address);
      let next = [...prev];
      if (idx !== -1) next[idx] = sess;
      else next.unshift(sess);
      saveSessionList(next);
      return next;
    });
  };

  const startCountdown = useCallback((expireAt) => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const left = timeLeft(expireAt);
      setTimeRemaining(left);
      if (left <= 0) {
        clearInterval(timerRef.current);
        setExpired(true);
        if (soundRef.current) playExpireSound();
        clearInterval(pollRef.current);
        setPollStatus('idle');
      }
    }, 1000);
  }, []);

  const stopPolling = () => {
    clearInterval(pollRef.current);
    setPollStatus('idle');
  };

  const startPolling = useCallback((tok, expAt) => {
    stopPolling();
    setPollStatus('polling');

    const pollFn = async () => {
      if (isExpired(expAt)) return;
      try {
        const { messages: msgs } = await getMessages(tok);
        const sorted = [...msgs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const incoming = new Set();
        let hasNew = false;
        let isInitial = seenIds.current.size === 0;

        sorted.forEach(m => {
          if (!seenIds.current.has(m.id)) {
            seenIds.current.add(m.id);
            if (!isInitial) {
              incoming.add(m.id);
              hasNew = true;
            }
          }
        });

        if (hasNew) {
          if (soundRef.current) playNewMailSound();
          setNewMailIds(prev => new Set([...prev, ...incoming]));
        }
        
        const unread = sorted.filter(m => !m.seen).length;
        setUnreadCount(unread);
        
        if (!isInitial) {
          setTotalReceived(prev => prev + incoming.size);
        } else {
          setTotalReceived(sorted.length);
        }

        setMessages(sorted);
        setPollStatus('polling');
      } catch (e) {
        setPollStatus('error');
      }
      
      // Reschedule based on latest interval
      clearInterval(pollRef.current);
      pollRef.current = setTimeout(pollFn, pollIntervalRef.current);
    };

    pollFn(); // Fetch immediately
  }, []);

  const loadActiveSession = useCallback(async (stored) => {
    if (!stored) return false;
    setLoading(true);
    if (!isExpired(stored.expireAt)) {
      try {
        const tokenData = await restoreSession(stored.address, stored.password);
        const sess = { ...stored, token: tokenData.token };
        setSession(sess);
        setExpired(false);
        setTimeRemaining(timeLeft(sess.expireAt));
        setSessionCreatedAt(stored.createdAt || Date.now());
        _updateSessions(sess);
        startCountdown(sess.expireAt);
        startPolling(sess.token, sess.expireAt);
        setLoading(false);
        return true;
      } catch (_) { }
    } else {
      setExpired(true);
      setSession({ ...stored, token: null });
      setLoading(false);
      return true;
    }
    return false;
  }, [startCountdown, startPolling]);

  const initSession = useCallback(async () => {
    setError(null);
    const list = loadSessionList();
    setSessionsList(list);
    
    if (list.length > 0) {
      const success = await loadActiveSession(list[0]);
      if (success) return;
    }
    await generateNew();
  }, [loadActiveSession]);

  const generateNew = useCallback(async (domain) => {
    setGenerating(true);
    setError(null);
    setExpired(false);
    setMessages([]);
    setSelectedMsg(null);
    setMsgContent(null);
    setUnreadCount(0);
    setNewMailIds(new Set());
    setTotalReceived(0);
    seenIds.current.clear();
    stopPolling();
    clearInterval(timerRef.current);

    try {
      const data = await createEmail(domain);
      const now = Date.now();
      const expireAt = now + TEN_MINUTES;
      const sess = {
        address:   data.address,
        password:  data.password,
        token:     data.token,
        id:        data.id,
        expireAt,
        createdAt: now,
      };
      
      _updateSessions(sess);
      saveSession(sess); // for backward compat default
      setSession(sess);
      setSessionCreatedAt(now);
      setTimeRemaining(TEN_MINUTES);
      startCountdown(expireAt);
      startPolling(sess.token, expireAt);
    } catch (e) {
      setError('Failed to generate email. Check your connection and try again.');
    } finally {
      setGenerating(false);
      setLoading(false);
    }
  }, [startCountdown, startPolling]);

  const restoreExpired = useCallback(async () => {
    if (!session) return generateNew();
    setGenerating(true);
    setError(null);
    try {
      const tokenData = await restoreSession(session.address, session.password);
      const newExpiry = extendSession();
      const now = Date.now();
      const sess = { ...session, token: tokenData.token, expireAt: newExpiry, createdAt: now };
      _updateSessions(sess);
      saveSession(sess);
      setSession(sess);
      setExpired(false);
      setSessionCreatedAt(now);
      setTimeRemaining(timeLeft(newExpiry));
      startCountdown(newExpiry);
      startPolling(sess.token, newExpiry);
    } catch (_) {
      await generateNew();
    } finally {
      setGenerating(false);
    }
  }, [session, generateNew, startCountdown, startPolling]);

  const extendActive = useCallback(() => {
    if (!session) return;
    const newExpiry = extendSession();
    const sess = { ...session, expireAt: newExpiry };
    _updateSessions(sess);
    saveSession(sess);
    setSession(sess);
    clearInterval(timerRef.current);
    startCountdown(newExpiry);
    stopPolling();
    startPolling(sess.token, newExpiry);
  }, [session, startCountdown, startPolling]);

  const openMessage = useCallback(async (msg) => {
    setSelectedMsg(msg);
    setMsgContent(null);
    setMsgLoading(true);
    setNewMailIds(prev => { const n = new Set(prev); n.delete(msg.id); return n; });
    if (!msg.seen) setUnreadCount(prev => Math.max(0, prev - 1));
    try {
      const { message } = await getMessage(session.token, msg.id);
      setMsgContent(message);
    } catch (e) {
      setMsgContent({ error: 'Failed to load email body.' });
    } finally {
      setMsgLoading(false);
    }
  }, [session]);

  const switchSession = useCallback(async (address) => {
    const target = sessionsList.find(s => s.address === address);
    if (!target || target.address === session?.address) return;
    
    stopPolling();
    clearInterval(timerRef.current);
    setMessages([]);
    setSelectedMsg(null);
    setMsgContent(null);
    setUnreadCount(0);
    setNewMailIds(new Set());
    setTotalReceived(0);
    seenIds.current.clear();
    
    saveSession(target); // set as primary active
    await loadActiveSession(target);
  }, [sessionsList, session, loadActiveSession]);

  const removeSession = useCallback((address) => {
    setSessionsList(prev => {
      const next = prev.filter(s => s.address !== address);
      saveSessionList(next);
      return next;
    });
    if (session?.address === address) {
      const nextActive = sessionsList.find(s => s.address !== address);
      if (nextActive) switchSession(nextActive.address);
      else generateNew();
    }
  }, [session, sessionsList, switchSession, generateNew]);

  const initStarted = useRef(false);

  useEffect(() => {
    if (initStarted.current) return;
    initStarted.current = true;
    initSession();
    return () => { 
      clearInterval(pollRef.current); 
      clearInterval(timerRef.current); 
      initStarted.current = false;
    };
  }, [initSession]);

  return {
    session, messages, selectedMsg, msgContent,
    loading, generating, msgLoading, error,
    timeRemaining, expired, unreadCount, newMailIds,
    soundEnabled, setSoundEnabled,
    totalReceived, pollStatus, sessionCreatedAt,
    generateNew, restoreExpired, extendActive, openMessage, setSelectedMsg,
    sessionsList, switchSession, removeSession,
    domains, pollInterval, setPollInterval
  };
}
