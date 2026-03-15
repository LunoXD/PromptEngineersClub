import { FormEvent, KeyboardEvent as ReactKeyboardEvent, MouseEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { io, Socket } from 'socket.io-client';
import { Bell, Hash, LogOut, Pencil, Reply, Save, SendHorizontal, Shield, UserRound, Volume2, VolumeX, X } from 'lucide-react';
import { api, AuthUser, ChatMessage, ChatServer, ChatServerMember } from '../lib/api';
import { clearAuthToken, getAuthToken } from '../lib/auth';
import profilePlaceholder from '../../assets/images/profileplaceholder.png';
import pingSound from '../../assets/sounds/ping.mp3';
import '../styles/server-chat-overhaul.css';

type ServerWithMembership = ChatServer & { isMember: boolean };

export function ServerChat() {
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [me, setMe] = useState<AuthUser | null>(null);
  const [servers, setServers] = useState<ServerWithMembership[]>([]);
  const [activeServerId, setActiveServerId] = useState('');
  const [serverMembers, setServerMembers] = useState<ChatServerMember[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [newServerName, setNewServerName] = useState('');
  const [profileName, setProfileName] = useState('');
  const [profileAvatarUrl, setProfileAvatarUrl] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [typingUsers, setTypingUsers] = useState<AuthUser[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; messageId: string } | null>(null);
  const [editingMessageId, setEditingMessageId] = useState('');
  const [editingDraft, setEditingDraft] = useState('');
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionAnchor, setMentionAnchor] = useState<{ start: number; end: number } | null>(null);
  const [mentionActiveIndex, setMentionActiveIndex] = useState(0);
  const [mentionBadgeCount, setMentionBadgeCount] = useState(0);
  const [replyingToMessageId, setReplyingToMessageId] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(() => window.localStorage.getItem('chatSoundEnabled') === '1');
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'reconnecting' | 'disconnected'
  >('connecting');
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimerRef = useRef<number | null>(null);
  const contextMenuRef = useRef<HTMLDivElement | null>(null);
  const messageInputRef = useRef<HTMLInputElement | null>(null);
  const pingAudioRef = useRef<HTMLAudioElement | null>(null);
  const activeServerIdRef = useRef('');
  const meIdRef = useRef('');

  const activeServer = useMemo(
    () => servers.find((s) => s._id === activeServerId),
    [servers, activeServerId]
  );
  const joinedServers = useMemo(() => servers.filter((s) => s.isMember), [servers]);
  const discoverServers = useMemo(() => servers.filter((s) => !s.isMember), [servers]);
  const adminMembers = useMemo(
    () => serverMembers.filter((member) => member.role === 'admin'),
    [serverMembers]
  );
  const regularMembers = useMemo(
    () => serverMembers.filter((member) => member.role !== 'admin'),
    [serverMembers]
  );
  const messageById = useMemo(
    () => new Map(messages.map((message) => [message._id, message])),
    [messages]
  );
  const knownUsers = useMemo(() => {
    const map = new Map<string, AuthUser>();

    if (me?._id) map.set(me._id, me);
    for (const message of messages) {
      if (message.user?._id) map.set(message.user._id, message.user);
    }
    for (const typingUser of typingUsers) {
      if (typingUser?._id) map.set(typingUser._id, typingUser);
    }
    for (const member of serverMembers) {
      if (member?._id) map.set(member._id, member);
    }

    return Array.from(map.values()).sort((a, b) => a.username.localeCompare(b.username));
  }, [me, messages, typingUsers, serverMembers]);
  const mentionSuggestions = useMemo(() => {
    if (!mentionAnchor) return [];
    const query = mentionQuery.trim().toLowerCase();
    return knownUsers
      .filter((user) => user.username?.trim())
      .filter((user) => user.username.toLowerCase().includes(query))
      .slice(0, 6);
  }, [knownUsers, mentionAnchor, mentionQuery]);
  const mentionMenuOpen = Boolean(mentionAnchor && mentionSuggestions.length);
  const isAdmin = me?.role === 'admin';
  const replyingToMessage = replyingToMessageId ? messageById.get(replyingToMessageId) || null : null;

  const messageMentionsCurrentUser = (message: Pick<ChatMessage, 'content' | 'user'>) => {
    const username = me?.username?.trim();
    if (!username) return false;
    if (message.user?._id === me?._id) return false;

    const mentionRegex = new RegExp(`(^|\\s)@${username.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}(?=\\s|$)`, 'i');
    return mentionRegex.test(message.content || '');
  };

  const messageRepliesToCurrentUser = (message: Pick<ChatMessage, 'replyTo' | 'user'>) => {
    if (!me?._id) return false;
    if (message.user?._id === me._id) return false;
    return message.replyTo?.user?._id === me._id;
  };

  const playNotificationPing = () => {
    if (!soundEnabled) return;
    const audio = pingAudioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {
      // Browsers may block autoplay until user interaction.
    });
  };

  useEffect(() => {
    const audio = new Audio(pingSound);
    audio.preload = 'auto';
    audio.volume = 0.9;
    pingAudioRef.current = audio;

    return () => {
      if (pingAudioRef.current) {
        pingAudioRef.current.pause();
      }
      pingAudioRef.current = null;
    };
  }, []);

  const enableSound = async () => {
    const audio = pingAudioRef.current;
    if (!audio) return;

    try {
      audio.currentTime = 0;
      await audio.play();
      audio.pause();
      audio.currentTime = 0;
      setSoundEnabled(true);
      window.localStorage.setItem('chatSoundEnabled', '1');
    } catch {
      setError('Browser blocked sound. Click again after interacting with the page.');
    }
  };

  const disableSound = () => {
    setSoundEnabled(false);
    window.localStorage.setItem('chatSoundEnabled', '0');
  };

  useEffect(() => {
    const t = getAuthToken();
    if (!t) {
      navigate('/login');
      return;
    }
    setToken(t);
  }, [navigate]);

  useEffect(() => {
    activeServerIdRef.current = activeServerId;
  }, [activeServerId]);

  useEffect(() => {
    meIdRef.current = me?._id || '';
  }, [me?._id]);

  useEffect(() => {
    if (!token) return;

    let mounted = true;
    Promise.all([api.me(token), api.getChatServers(token)])
      .then(([meData, serversData]) => {
        if (!mounted) return;
        setMe(meData.user);
        setProfileName(meData.user.username || '');
        setProfileAvatarUrl(meData.user.avatarUrl || '');
        setServers(serversData as ServerWithMembership[]);
        const joined = (serversData as ServerWithMembership[]).find((s) => s.isMember);
        if (joined) setActiveServerId(joined._id);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load chat');
        clearAuthToken();
        navigate('/login');
      });

    const socket = io('/', { auth: { token } });
    setConnectionStatus('connecting');
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnectionStatus('connected');
      const currentServerId = activeServerIdRef.current;
      if (currentServerId) {
        socket.emit('chat:join-server', { serverId: currentServerId });
      }
    });

    socket.on('disconnect', () => {
      setConnectionStatus('disconnected');
    });

    socket.on('connect_error', () => {
      setConnectionStatus('reconnecting');
    });

    socket.io.on('reconnect_attempt', () => {
      setConnectionStatus('reconnecting');
    });

    socket.io.on('reconnect', () => {
      setConnectionStatus('connected');
      const currentServerId = activeServerIdRef.current;
      if (currentServerId) {
        socket.emit('chat:join-server', { serverId: currentServerId });
      }
    });

    socket.on('chat:new-message', (msg: ChatMessage) => {
      if (
        msg.serverId === activeServerIdRef.current &&
        (messageMentionsCurrentUser(msg) || messageRepliesToCurrentUser(msg))
      ) {
        setMentionBadgeCount((prev) => prev + 1);
        playNotificationPing();
      }
      setMessages((prev) => (prev.some((item) => item._id === msg._id) ? prev : [...prev, msg]));
    });
    socket.on('chat:message-updated', (msg: ChatMessage) => {
      if (
        msg.serverId === activeServerIdRef.current &&
        (messageMentionsCurrentUser(msg) || messageRepliesToCurrentUser(msg))
      ) {
        setMentionBadgeCount((prev) => prev + 1);
        playNotificationPing();
      }
      setMessages((prev) => prev.map((item) => (item._id === msg._id ? { ...item, ...msg } : item)));
    });
    socket.on('chat:message-deleted', (payload: { _id: string }) => {
      if (!payload?._id) return;
      setMessages((prev) => prev.filter((item) => item._id !== payload._id));
    });
    socket.on('chat:message-reactions', (payload: { _id: string; reactions: ChatMessage['reactions'] }) => {
      if (!payload?._id) return;
      setMessages((prev) =>
        prev.map((item) => (item._id === payload._id ? { ...item, reactions: payload.reactions || [] } : item))
      );
    });
    socket.on(
      'chat:typing',
      (payload: { serverId: string; isTyping: boolean; user: AuthUser }) => {
        if (!payload?.serverId || payload.serverId !== activeServerIdRef.current) return;
        if (!payload?.user?._id || payload.user._id === meIdRef.current) return;

        setTypingUsers((prev) => {
          if (payload.isTyping) {
            if (prev.some((u) => u._id === payload.user._id)) return prev;
            return [...prev, payload.user];
          }
          return prev.filter((u) => u._id !== payload.user._id);
        });
      }
    );

    return () => {
      mounted = false;
      socket.disconnect();
    };
  }, [token, navigate]);

  useEffect(() => {
    if (!activeServerId || !token) return;
    setServerMembers([]);
    Promise.all([
      api.getChatMessages(activeServerId, token),
      api.getChatServerMembers(activeServerId, token),
    ])
      .then(([messagesData, membersData]) => {
        setMessages(messagesData);
        setServerMembers(membersData);
        setMentionBadgeCount(0);
        setReplyingToMessageId('');
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load messages'));

    setTypingUsers([]);
    socketRef.current?.emit('chat:join-server', { serverId: activeServerId });
  }, [activeServerId, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setContextMenu(null);
    };

    window.addEventListener('click', closeMenu);
    window.addEventListener('scroll', closeMenu, true);
    window.addEventListener('keydown', onEsc);

    return () => {
      window.removeEventListener('click', closeMenu);
      window.removeEventListener('scroll', closeMenu, true);
      window.removeEventListener('keydown', onEsc);
    };
  }, []);

  const logout = async () => {
    if (token) {
      try {
        await api.logout(token);
      } catch {
        // local logout fallback
      }
    }
    clearAuthToken();
    navigate('/login');
  };

  const joinServer = async (serverId: string) => {
    if (!token) return;
    await api.joinChatServer(serverId, token);
    const updated = await api.getChatServers(token);
    setServers(updated as ServerWithMembership[]);
    setActiveServerId(serverId);
  };

  const createServer = async () => {
    if (!token || !newServerName.trim()) return;
    setBusy(true);
    try {
      await api.createChatServer({ name: newServerName.trim() }, token);
      const updated = await api.getChatServers(token);
      setServers(updated as ServerWithMembership[]);
      setNewServerName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create server');
    } finally {
      setBusy(false);
    }
  };

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!token || !activeServerId || !input.trim()) return;
    const content = input.trim();
    setInput('');
    setMentionQuery('');
    setMentionAnchor(null);
    setMentionActiveIndex(0);
    socketRef.current?.emit('chat:typing-stop', { serverId: activeServerId });
    try {
      const sent = replyingToMessageId
        ? await api.sendChatReplyMessage(activeServerId, content, replyingToMessageId, token)
        : await api.sendChatMessage(activeServerId, content, token);
      setMessages((prev) => (prev.some((item) => item._id === sent._id) ? prev : [...prev, sent]));
      setReplyingToMessageId('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  };

  const canManageMessage = (message: ChatMessage) =>
    message.user?._id === me?._id || isAdmin;

  const updateMentionState = (rawValue: string, cursorPos: number) => {
    const left = rawValue.slice(0, cursorPos);
    const match = left.match(/(?:^|\s)@([a-zA-Z0-9_.-]{0,32})$/);

    if (!match) {
      setMentionAnchor(null);
      setMentionQuery('');
      setMentionActiveIndex(0);
      return;
    }

    const query = match[1] ?? '';
    const end = cursorPos;
    const start = end - query.length - 1;

    setMentionQuery(query);
    setMentionAnchor({ start, end });
    setMentionActiveIndex(0);
  };

  const applyMention = (username: string) => {
    if (!mentionAnchor) return;

    const before = input.slice(0, mentionAnchor.start);
    const after = input.slice(mentionAnchor.end);
    const nextValue = `${before}@${username} ${after}`;
    const caret = `${before}@${username} `.length;

    setInput(nextValue);
    setMentionQuery('');
    setMentionAnchor(null);
    setMentionActiveIndex(0);

    window.requestAnimationFrame(() => {
      messageInputRef.current?.focus();
      messageInputRef.current?.setSelectionRange(caret, caret);
    });
  };

  const onComposerKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (!mentionMenuOpen) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setMentionActiveIndex((prev) => (prev + 1) % mentionSuggestions.length);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setMentionActiveIndex((prev) => (prev - 1 + mentionSuggestions.length) % mentionSuggestions.length);
      return;
    }

    if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault();
      const selected = mentionSuggestions[mentionActiveIndex] || mentionSuggestions[0];
      if (selected?.username) applyMention(selected.username);
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      setMentionQuery('');
      setMentionAnchor(null);
      setMentionActiveIndex(0);
    }
  };

  const openMessageContextMenu = (
    event: MouseEvent<HTMLDivElement>,
    messageId: string
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({ x: event.clientX, y: event.clientY, messageId });
  };

  const beginEditMessage = (message: ChatMessage) => {
    if (!canManageMessage(message)) return;
    setEditingMessageId(message._id);
    setEditingDraft(message.content);
    setContextMenu(null);
  };

  const cancelEditMessage = () => {
    setEditingMessageId('');
    setEditingDraft('');
  };

  const saveEditedMessage = async (messageId: string) => {
    if (!token || !activeServerId || !editingDraft.trim()) return;
    try {
      const updated = await api.editChatMessage(activeServerId, messageId, editingDraft.trim(), token);
      setMessages((prev) => prev.map((item) => (item._id === updated._id ? { ...item, ...updated } : item)));
      cancelEditMessage();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to edit message');
    }
  };

  const deleteMessage = async (message: ChatMessage) => {
    if (!token || !activeServerId || !canManageMessage(message)) return;
    try {
      await api.deleteChatMessage(activeServerId, message._id, token);
      setMessages((prev) => prev.filter((item) => item._id !== message._id));
      setContextMenu(null);
      if (editingMessageId === message._id) cancelEditMessage();
      if (replyingToMessageId === message._id) setReplyingToMessageId('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete message');
    }
  };

  const startReply = (message: ChatMessage) => {
    setReplyingToMessageId(message._id);
    setContextMenu(null);
    window.setTimeout(() => messageInputRef.current?.focus(), 0);
  };

  const toggleReaction = async (message: ChatMessage, emoji: string) => {
    if (!token || !activeServerId) return;
    try {
      const payload = await api.toggleChatMessageReaction(activeServerId, message._id, emoji, token);
      setMessages((prev) =>
        prev.map((item) => (item._id === payload._id ? { ...item, reactions: payload.reactions || [] } : item))
      );
      setContextMenu(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to react to message');
    }
  };

  const pingUser = (message: ChatMessage) => {
    const username = message.user?.username?.trim();
    if (!username) return;
    const mention = `@${username} `;
    setInput((prev) => (prev.includes(mention) ? prev : `${prev}${prev ? ' ' : ''}${mention}`));
    setContextMenu(null);
    window.setTimeout(() => messageInputRef.current?.focus(), 0);
  };

  const copyMessageText = async (message: ChatMessage) => {
    try {
      await navigator.clipboard.writeText(message.content || '');
      setContextMenu(null);
    } catch {
      setError('Failed to copy message');
    }
  };

  const hasReacted = (message: ChatMessage, emoji: string) => {
    if (!me?._id) return false;
    const target = (message.reactions || []).find((entry) => entry.emoji === emoji);
    if (!target) return false;
    return (target.users || []).includes(me._id);
  };

  const renderMessageWithMentions = (content: string) => {
    const currentUsername = me?.username?.trim();
    const mentionRegex = /(@[a-zA-Z0-9_.-]+)/g;
    const parts = content.split(mentionRegex);

    return parts.map((part, index) => {
      if (!part.startsWith('@')) {
        return <span key={`${part}-${index}`}>{part}</span>;
      }

      const isOwnMention =
        !!currentUsername && part.slice(1).toLowerCase() === currentUsername.toLowerCase();

      return (
        <span
          key={`${part}-${index}`}
          className={`chat-mention ${isOwnMention ? 'chat-mention-own' : ''}`}
        >
          {part}
        </span>
      );
    });
  };

  const clearMentionBadge = () => setMentionBadgeCount(0);

  const emitTyping = (value: string) => {
    if (!activeServerId || !socketRef.current) return;
    if (!value.trim()) {
      socketRef.current.emit('chat:typing-stop', { serverId: activeServerId });
      if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
      return;
    }

    socketRef.current.emit('chat:typing-start', { serverId: activeServerId });
    if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current);
    typingTimerRef.current = window.setTimeout(() => {
      socketRef.current?.emit('chat:typing-stop', { serverId: activeServerId });
      typingTimerRef.current = null;
    }, 1200);
  };

  const formatTime = (isoDate: string) =>
    new Date(isoDate).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

  const initials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
  };

  const saveProfile = async () => {
    if (!token) return;
    setProfileSaving(true);
    setError('');
    try {
      const result = await api.updateProfile(
        {
          username: profileName.trim(),
          avatarUrl: profileAvatarUrl.trim(),
        },
        token
      );
      setMe(result.user);
      setProfileName(result.user.username || '');
      setProfileAvatarUrl(result.user.avatarUrl || '');
      setProfileEditOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  return (
    <div
      className="chat-shell h-[100dvh] w-full overflow-hidden"
      onContextMenu={(event) => {
        const target = event.target as HTMLElement;
        if (target.closest('[data-message-id]')) return;
        event.preventDefault();
        setContextMenu(null);
      }}
    >
      <div className="chat-frame h-full w-full rounded-none border-0 shadow-none bg-card/80">
        <div className="h-full grid grid-cols-1 md:grid-cols-[88px_300px_1fr] xl:grid-cols-[88px_300px_minmax(0,1fr)_260px]">
          <aside className="chat-rail hidden md:flex border-r border-border bg-background/75 p-3 flex-col items-center justify-between">
            <div className="space-y-3 w-full">
              <img
                src={me?.avatarUrl || profilePlaceholder}
                alt="User avatar"
                className="w-14 h-14 rounded-2xl object-cover border border-border mx-auto shadow-md"
              />
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Signed in as</p>
                <p className="text-xs font-semibold truncate px-1">{me?.username || 'Member'}</p>
              </div>
            </div>

            <button
              onClick={logout}
              className="chat-action w-full text-xs rounded-xl border border-border px-2.5 py-2 hover:bg-accent/70 transition-colors inline-flex items-center justify-center gap-1.5"
            >
              <LogOut size={14} />
              Logout
            </button>
          </aside>

          <aside className="chat-sidebar border-b md:border-b-0 md:border-r border-border bg-card/70 p-3 md:p-4 overflow-y-auto chat-scroll">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-base tracking-wide">Servers</h2>
              {me?.role === 'admin' && (
                <span className="chat-chip inline-flex items-center gap-1 px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                  <Shield size={11} />
                  Admin
                </span>
              )}
            </div>

            <div className="chat-card mb-4 p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Your profile</p>
                <button
                  onClick={() => setProfileEditOpen((prev) => !prev)}
                  className="chat-action text-xs rounded-lg border border-border px-2 py-1 inline-flex items-center gap-1"
                  type="button"
                >
                  <Pencil size={12} />
                  {profileEditOpen ? 'Close' : 'Edit'}
                </button>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <img
                  src={me?.avatarUrl || profilePlaceholder}
                  alt="Profile"
                  className="w-9 h-9 rounded-xl object-cover border border-border"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{me?.username || 'Member'}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{me?.email || 'No email'}</p>
                </div>
              </div>

              {profileEditOpen && (
                <div className="space-y-2.5 mt-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Display Name</label>
                    <input
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="Your name"
                      className="chat-input w-full px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Avatar URL</label>
                    <input
                      value={profileAvatarUrl}
                      onChange={(e) => setProfileAvatarUrl(e.target.value)}
                      placeholder="https://your-avatar-url"
                      className="chat-input w-full px-3 py-2 text-sm"
                    />
                  </div>
                  <button
                    onClick={saveProfile}
                    disabled={profileSaving || !profileName.trim()}
                    type="button"
                    className="chat-action w-full rounded-xl bg-primary text-primary-foreground px-3 py-2 text-sm font-semibold inline-flex items-center justify-center gap-1.5 disabled:opacity-60"
                  >
                    <Save size={14} />
                    {profileSaving ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              )}
            </div>

            <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">Joined</p>
            <div className="space-y-2 mb-4">
              {joinedServers.length > 0 ? (
                joinedServers.map((server) => (
                  <button
                    key={server._id}
                    onClick={() => setActiveServerId(server._id)}
                    className={`chat-row-btn w-full text-left px-3 py-2.5 text-sm transition-colors ${
                      server._id === activeServerId
                        ? 'chat-row-btn-active text-primary-foreground'
                        : 'bg-background/60 border-border hover:bg-accent/70'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Hash size={14} />
                      <span className="truncate">{server.name}</span>
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-xs text-muted-foreground px-1">You have not joined any server yet.</p>
              )}
            </div>

            <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">Discover</p>
            <div className="space-y-2 mb-4">
              {discoverServers.length > 0 ? (
                discoverServers.map((server) => (
                  <button
                    key={server._id}
                    onClick={() => joinServer(server._id)}
                    className="chat-row-btn w-full text-left px-3 py-2.5 text-sm bg-background/60 border border-border hover:bg-accent/70"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate">{server.name}</span>
                      <span className="text-[10px] uppercase text-muted-foreground">Join</span>
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-xs text-muted-foreground px-1">No more public servers to join.</p>
              )}
            </div>

            {me?.role === 'admin' && (
              <div className="pt-3 border-t border-border space-y-2.5">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Create server</p>
                <input
                  value={newServerName}
                  onChange={(e) => setNewServerName(e.target.value)}
                  placeholder="New server name"
                  className="chat-input w-full px-3 py-2 text-sm"
                />
                <button
                  onClick={createServer}
                  disabled={busy || !newServerName.trim()}
                  className="chat-action w-full rounded-xl bg-primary text-primary-foreground px-3 py-2 text-sm font-semibold disabled:opacity-60"
                >
                  {busy ? 'Creating...' : 'Create Server'}
                </button>
              </div>
            )}
          </aside>

          <section className="chat-main min-h-0 grid grid-rows-[64px_1fr_72px]">
            <header className="chat-header border-b border-border px-4 md:px-5 flex items-center justify-between bg-background/55 backdrop-blur">
              <div className="min-w-0">
                <h3 className="font-semibold truncate">#{activeServer?.name || 'Select a server'}</h3>
                <p className="text-xs text-muted-foreground truncate">
                  {activeServer?.description || 'Pick a server from the left to start chatting.'}
                </p>
              </div>
              <span
                className={`chat-status hidden md:inline-flex items-center rounded-full border px-2 py-1 text-[10px] uppercase tracking-wide ${
                  connectionStatus === 'connected'
                    ? 'chat-status-connected'
                    : connectionStatus === 'reconnecting'
                      ? 'chat-status-reconnecting'
                      : connectionStatus === 'connecting'
                        ? 'chat-status-connecting'
                        : 'chat-status-disconnected'
                }`}
              >
                {connectionStatus}
              </span>
              <button
                type="button"
                onClick={clearMentionBadge}
                className={`chat-mention-badge hidden md:inline-flex items-center gap-1 ${mentionBadgeCount > 0 ? 'chat-mention-badge-hot' : ''}`}
                title="Mentions"
              >
                <Bell size={13} />
                <span>{mentionBadgeCount > 99 ? '99+' : mentionBadgeCount}</span>
              </button>
              <button
                type="button"
                onClick={soundEnabled ? disableSound : enableSound}
                className={`chat-sound-toggle hidden md:inline-flex ${soundEnabled ? 'chat-sound-toggle-on' : ''}`}
                title={soundEnabled ? 'Disable notification sound' : 'Enable notification sound'}
              >
                {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                <span>{soundEnabled ? 'Sound on' : 'Enable sound'}</span>
              </button>
              <button
                onClick={logout}
                className="chat-action md:hidden text-xs rounded-lg border border-border px-2.5 py-1.5 inline-flex items-center gap-1.5"
              >
                <LogOut size={13} />
                Logout
              </button>
            </header>

            <div className="chat-scroll overflow-y-auto p-4 md:p-5 space-y-3 bg-background/70">
              {messages.length > 0 ? (
                messages.map((msg) => {
                  const isOwn = msg.user?._id === me?._id;
                  return (
                    <div
                      key={msg._id}
                      className="flex gap-2 justify-start"
                      data-message-id={msg._id}
                      onContextMenu={(event) => openMessageContextMenu(event, msg._id)}
                      onDoubleClick={() => {
                        if (canManageMessage(msg)) beginEditMessage(msg);
                      }}
                    >
                      {msg.user?.avatarUrl ? (
                        <img
                          src={msg.user.avatarUrl}
                          alt={msg.user?.username || 'User'}
                          className="w-8 h-8 rounded-full border border-border object-cover shrink-0 mt-1 shadow-sm"
                        />
                      ) : (
                        <div className="chat-avatar-fallback w-8 h-8 rounded-full border border-border grid place-items-center text-[11px] font-semibold shrink-0 mt-1">
                          {initials(msg.user?.username)}
                        </div>
                      )}

                      <div
                        className={`chat-message max-w-[85%] md:max-w-[72%] px-3.5 py-2.5 ${
                          isOwn ? 'chat-message-self' : 'chat-message-other'
                        }`}
                      >
                        <div className={`chat-meta text-[11px] mb-1 ${isOwn ? 'text-primary-foreground/85' : 'text-muted-foreground'}`}>
                          <span className="font-semibold">{msg.user?.username || 'User'}</span>
                          {' · '}
                          {formatTime(msg.createdAt)}
                          {msg.editedAt ? ' · edited' : ''}
                        </div>
                        {msg.replyTo && (
                          <button
                            type="button"
                            className="chat-reply-preview"
                            onClick={() => setReplyingToMessageId(msg.replyTo?._id || '')}
                          >
                            <span className="chat-reply-preview-label">Reply to @{msg.replyTo.user?.username || 'user'}</span>
                            <span className="chat-reply-preview-content">{msg.replyTo.content}</span>
                          </button>
                        )}
                        {editingMessageId === msg._id ? (
                          <div className="space-y-2">
                            <input
                              value={editingDraft}
                              onChange={(event) => setEditingDraft(event.target.value)}
                              className="chat-input w-full px-2.5 py-1.5 text-sm"
                              autoFocus
                            />
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                className="chat-action rounded-md border border-border px-2 py-1 text-xs"
                                onClick={cancelEditMessage}
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                className="chat-action rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground"
                                onClick={() => saveEditedMessage(msg._id)}
                                disabled={!editingDraft.trim()}
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm leading-relaxed break-words">{renderMessageWithMentions(msg.content)}</p>
                        )}
                        {!!msg.reactions?.length && (
                          <div className="chat-reactions-row">
                            {msg.reactions.map((reaction) => (
                              <button
                                key={`${msg._id}-${reaction.emoji}`}
                                type="button"
                                className={`chat-reaction-chip ${hasReacted(msg, reaction.emoji) ? 'chat-reaction-chip-active' : ''}`}
                                onClick={() => toggleReaction(msg, reaction.emoji)}
                              >
                                <span>{reaction.emoji}</span>
                                <span>{reaction.count}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-full grid place-items-center">
                  <div className="text-center max-w-sm">
                    <div className="chat-empty-badge w-14 h-14 grid place-items-center mx-auto mb-3">
                      <UserRound size={20} className="text-muted-foreground" />
                    </div>
                    <p className="text-sm font-semibold mb-1">No messages yet</p>
                    <p className="text-xs text-muted-foreground">Send the first message and start the conversation.</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {!!typingUsers.length && (
              <div className="px-4 md:px-5 pb-2 text-xs text-muted-foreground inline-flex items-center gap-1.5">
                <span>{typingUsers[0].username}</span>
                <span>{typingUsers.length > 1 ? `and ${typingUsers.length - 1} other(s)` : ''}</span>
                <span>typing</span>
                <span className="inline-flex items-center gap-1">
                  <span className="chat-typing-dot" />
                  <span className="chat-typing-dot" />
                  <span className="chat-typing-dot" />
                </span>
              </div>
            )}

            <form onSubmit={sendMessage} className="chat-composer border-t border-border p-3 md:p-4 bg-card/75">
              <div className="relative chat-card flex items-center gap-2 px-2 py-2 bg-background/40">
                {replyingToMessage && (
                  <div className="chat-replying-banner absolute left-2 right-2 bottom-full mb-2">
                    <div className="chat-replying-banner-text">
                      Replying to @{replyingToMessage.user?.username || 'user'}: {replyingToMessage.content}
                    </div>
                    <button
                      type="button"
                      className="chat-replying-close"
                      onClick={() => setReplyingToMessageId('')}
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
                {mentionMenuOpen && (
                  <div className="chat-mentions-menu absolute left-2 right-2 bottom-full mb-2 max-h-56 overflow-y-auto chat-scroll">
                    {mentionSuggestions.map((user, index) => (
                      <button
                        key={user._id}
                        type="button"
                        className={`chat-mentions-item ${mentionActiveIndex === index ? 'chat-mentions-item-active' : ''}`}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => applyMention(user.username)}
                      >
                        <span className="font-semibold">@{user.username}</span>
                        <span className="text-[11px] text-muted-foreground ml-2">{user._id === me?._id ? 'you' : 'member'}</span>
                      </button>
                    ))}
                  </div>
                )}
                <input
                  ref={messageInputRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    emitTyping(e.target.value);
                    updateMentionState(e.target.value, e.target.selectionStart ?? e.target.value.length);
                  }}
                  onKeyDown={onComposerKeyDown}
                  placeholder={activeServerId ? 'Type your message...' : 'Select a server to start chatting'}
                  className="chat-input flex-1 bg-transparent px-2 py-1.5 text-sm"
                  disabled={!activeServerId}
                />
                <button
                  type="submit"
                  className="chat-action chat-send rounded-xl text-primary-foreground px-3 py-2 text-sm font-semibold inline-flex items-center gap-1.5 disabled:opacity-60"
                  disabled={!activeServerId || !input.trim()}
                >
                  <SendHorizontal size={15} />
                  {replyingToMessage ? 'Reply' : 'Send'}
                </button>
              </div>
            </form>
          </section>

          <aside className="hidden xl:flex flex-col border-l border-border bg-card/70 p-4 overflow-y-auto chat-scroll">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Members</h4>
              <span className="text-xs text-muted-foreground">{serverMembers.length}</span>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">
                  Admins - {adminMembers.length}
                </p>
                <div className="space-y-1.5">
                  {adminMembers.length > 0 ? (
                    adminMembers.map((member) => (
                      <div
                        key={member._id}
                        className="chat-card px-2.5 py-2 flex items-center gap-2"
                      >
                        {member.avatarUrl ? (
                          <img
                            src={member.avatarUrl}
                            alt={member.username}
                            className="w-7 h-7 rounded-full border border-border object-cover shrink-0"
                          />
                        ) : (
                          <div className="chat-avatar-fallback w-7 h-7 rounded-full border border-border grid place-items-center text-[10px] font-semibold shrink-0">
                            {initials(member.username)}
                          </div>
                        )}
                        <p className="text-sm truncate font-medium">{member.username}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">No admins visible.</p>
                  )}
                </div>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">
                  Members - {regularMembers.length}
                </p>
                <div className="space-y-1.5">
                  {regularMembers.length > 0 ? (
                    regularMembers.map((member) => (
                      <div
                        key={member._id}
                        className="chat-card px-2.5 py-2 flex items-center gap-2"
                      >
                        {member.avatarUrl ? (
                          <img
                            src={member.avatarUrl}
                            alt={member.username}
                            className="w-7 h-7 rounded-full border border-border object-cover shrink-0"
                          />
                        ) : (
                          <div className="chat-avatar-fallback w-7 h-7 rounded-full border border-border grid place-items-center text-[10px] font-semibold shrink-0">
                            {initials(member.username)}
                          </div>
                        )}
                        <p className="text-sm truncate">{member.username}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">No members visible.</p>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {error && (
        <div className="chat-error fixed bottom-4 right-4 z-50 max-w-sm px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      )}

      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="chat-context-menu fixed z-[80] min-w-[170px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(event) => event.stopPropagation()}
        >
          {(() => {
            const selectedMessage = messageById.get(contextMenu.messageId);
            if (!selectedMessage) return null;
            const canManage = canManageMessage(selectedMessage);
            return (
              <>
                <button
                  type="button"
                  className="chat-context-item"
                  onClick={() => pingUser(selectedMessage)}
                >
                  Ping @{selectedMessage.user?.username || 'user'}
                </button>
                <button
                  type="button"
                  className="chat-context-item"
                  onClick={() => startReply(selectedMessage)}
                >
                  <Reply size={13} /> Reply to message
                </button>
                <button
                  type="button"
                  className="chat-context-item"
                  onClick={() => toggleReaction(selectedMessage, '👍')}
                >
                  React 👍
                </button>
                <button
                  type="button"
                  className="chat-context-item"
                  onClick={() => toggleReaction(selectedMessage, '🔥')}
                >
                  React 🔥
                </button>
                <button
                  type="button"
                  className="chat-context-item"
                  onClick={() => copyMessageText(selectedMessage)}
                >
                  Copy message
                </button>
                {canManage && (
                  <button
                    type="button"
                    className="chat-context-item"
                    onClick={() => beginEditMessage(selectedMessage)}
                  >
                    Edit message
                  </button>
                )}
                {canManage && (
                  <button
                    type="button"
                    className="chat-context-item chat-context-item-danger"
                    onClick={() => deleteMessage(selectedMessage)}
                  >
                    Delete message
                  </button>
                )}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
