import React from 'react';

const STATUS_CONFIG = {
  NEW: {
    label: 'NEW',
    bg: '#d8ff55',
    text: '#10100f',
    border: '#bfe63c'
  },
  CONTACTED: {
    label: 'CONTACTED',
    bg: '#e0f2fe',
    text: '#0369a1',
    border: '#bae6fd'
  },
  QUALIFIED: {
    label: 'QUALIFIED',
    bg: '#fef3c7',
    text: '#b45309',
    border: '#fde68a'
  },
  PROPOSAL: {
    label: 'PROPOSAL',
    bg: '#f3e8ff',
    text: '#7e22ce',
    border: '#e9d5ff'
  },
  NEGOTIATION: {
    label: 'NEGOTIATION',
    bg: '#ffedd5',
    text: '#c2410c',
    border: '#fed7aa'
  },
  WON: {
    label: 'WON',
    bg: '#dcfce7',
    text: '#15803d',
    border: '#bbf7d0'
  },
  LOST: {
    label: 'LOST',
    bg: '#fee2e2',
    text: '#b91c1c',
    border: '#fecaca'
  }
};

const PRIORITY_CONFIG = {
  LOW: {
    label: 'LOW',
    bg: '#f4f1e9',
    text: '#68665e',
    border: '#d4d0c5'
  },
  MEDIUM: {
    label: 'MED',
    bg: '#e0f2fe',
    text: '#0369a1',
    border: '#bae6fd'
  },
  HIGH: {
    label: 'HIGH',
    bg: '#fef3c7',
    text: '#b45309',
    border: '#fde68a'
  },
  URGENT: {
    label: 'URGENT',
    bg: '#fee2e2',
    text: '#dc2626',
    border: '#fca5a5'
  }
};

const CLIENT_STATUS_CONFIG = {
  ACTIVE: {
    label: 'ACTIVE',
    bg: '#dcfce7',
    text: '#15803d',
    border: '#bbf7d0'
  },
  ON_HOLD: {
    label: 'ON HOLD',
    bg: '#fef3c7',
    text: '#b45309',
    border: '#fde68a'
  },
  COMPLETED: {
    label: 'COMPLETED',
    bg: '#e0f2fe',
    text: '#0369a1',
    border: '#bae6fd'
  },
  ARCHIVED: {
    label: 'ARCHIVED',
    bg: '#f4f1e9',
    text: '#68665e',
    border: '#d4d0c5'
  }
};

const ONBOARDING_STATUS_CONFIG = {
  NOT_STARTED: {
    label: 'NOT STARTED',
    bg: '#f4f1e9',
    text: '#68665e',
    border: '#d4d0c5'
  },
  IN_PROGRESS: {
    label: 'IN PROGRESS',
    bg: '#e0f2fe',
    text: '#0369a1',
    border: '#bae6fd'
  },
  WAITING_FOR_CLIENT: {
    label: 'WAITING ON CLIENT',
    bg: '#fff7ed',
    text: '#c2410c',
    border: '#ffedd5'
  },
  COMPLETED: {
    label: 'COMPLETED',
    bg: '#dcfce7',
    text: '#15803d',
    border: '#bbf7d0'
  }
};

export default function StatusBadge({ status, size = 'normal' }) {
  const normalized = (status || 'NEW').toUpperCase();
  const config = STATUS_CONFIG[normalized] || {
    label: normalized,
    bg: '#e5e5e5',
    text: '#404040',
    border: '#d4d4d4'
  };

  const isSmall = size === 'small';

  return (
    <span
      className={`status-badge status-${normalized.toLowerCase()}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: isSmall ? '3px 8px' : '5px 12px',
        borderRadius: '999px',
        fontSize: isSmall ? '10px' : '11px',
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        backgroundColor: config.bg,
        color: config.text,
        border: `1px solid ${config.border}`,
        lineHeight: 1,
        whiteSpace: 'nowrap'
      }}
    >
      <span
        style={{
          width: isSmall ? '5px' : '6px',
          height: isSmall ? '5px' : '6px',
          borderRadius: '50%',
          backgroundColor: config.text,
          opacity: 0.85
        }}
      />
      {config.label}
    </span>
  );
}

export function PriorityBadge({ priority, size = 'normal' }) {
  const normalized = (priority || 'MEDIUM').toUpperCase();
  const config = PRIORITY_CONFIG[normalized] || PRIORITY_CONFIG.MEDIUM;
  const isSmall = size === 'small';

  return (
    <span
      className={`priority-badge priority-${normalized.toLowerCase()}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: isSmall ? '2px 7px' : '4px 10px',
        borderRadius: '4px',
        fontSize: isSmall ? '9px' : '10px',
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        backgroundColor: config.bg,
        color: config.text,
        border: `1px solid ${config.border}`,
        lineHeight: 1,
        whiteSpace: 'nowrap'
      }}
    >
      {config.label}
    </span>
  );
}

export function ClientStatusBadge({ status, size = 'normal' }) {
  const normalized = (status || 'ACTIVE').toUpperCase();
  const config = CLIENT_STATUS_CONFIG[normalized] || CLIENT_STATUS_CONFIG.ACTIVE;
  const isSmall = size === 'small';

  return (
    <span
      className={`client-status-badge client-status-${normalized.toLowerCase()}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: isSmall ? '3px 8px' : '5px 12px',
        borderRadius: '999px',
        fontSize: isSmall ? '10px' : '11px',
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        backgroundColor: config.bg,
        color: config.text,
        border: `1px solid ${config.border}`,
        lineHeight: 1,
        whiteSpace: 'nowrap'
      }}
    >
      <span
        style={{
          width: isSmall ? '5px' : '6px',
          height: isSmall ? '5px' : '6px',
          borderRadius: '50%',
          backgroundColor: config.text,
          opacity: 0.85
        }}
      />
      {config.label}
    </span>
  );
}

export function OnboardingStatusBadge({ status, size = 'normal' }) {
  const normalized = (status || 'NOT_STARTED').toUpperCase();
  const config = ONBOARDING_STATUS_CONFIG[normalized] || ONBOARDING_STATUS_CONFIG.NOT_STARTED;
  const isSmall = size === 'small';

  return (
    <span
      className={`onboarding-badge onboarding-${normalized.toLowerCase()}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: isSmall ? '2px 7px' : '4px 10px',
        borderRadius: '4px',
        fontSize: isSmall ? '9px' : '10px',
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        backgroundColor: config.bg,
        color: config.text,
        border: `1px solid ${config.border}`,
        lineHeight: 1,
        whiteSpace: 'nowrap'
      }}
    >
      {config.label}
    </span>
  );
}

export function FollowUpBadge({ dateStr }) {
  if (!dateStr) return null;

  const targetDate = new Date(dateStr);
  const now = new Date();

  // Reset hours for date comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());

  const diffDays = Math.round((targetDay - today) / (1000 * 60 * 60 * 24));

  let label = '';
  let style = {};

  if (diffDays < 0) {
    label = `OVERDUE • ${Math.abs(diffDays)}d ago`;
    style = { bg: '#fee2e2', text: '#dc2626', border: '#fca5a5' };
  } else if (diffDays === 0) {
    label = 'DUE TODAY';
    style = { bg: '#d8ff55', text: '#10100f', border: '#bfe63c' };
  } else if (diffDays === 1) {
    label = 'DUE TOMORROW';
    style = { bg: '#fef3c7', text: '#b45309', border: '#fde68a' };
  } else {
    label = `In ${diffDays} days`;
    style = { bg: '#f4f1e9', text: '#68665e', border: '#d4d0c5' };
  }

  return (
    <span
      className="follow-up-badge"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '10px',
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        backgroundColor: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
        lineHeight: 1.2,
        whiteSpace: 'nowrap'
      }}
    >
      {label}
    </span>
  );
}

export function ProposalStatusBadge({ status, size = 'normal' }) {
  const normalized = (status || 'DRAFT').toUpperCase();
  const configs = {
    DRAFT: { label: 'DRAFT', bg: '#f4f1e9', text: '#68665e', border: '#d4d0c5' },
    SENT: { label: 'SENT', bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd' },
    VIEWED: { label: 'VIEWED', bg: '#f3e8ff', text: '#7e22ce', border: '#e9d5ff' },
    ACCEPTED: { label: 'ACCEPTED', bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' },
    REJECTED: { label: 'DECLINED', bg: '#fee2e2', text: '#b91c1c', border: '#fecaca' },
    EXPIRED: { label: 'EXPIRED', bg: '#e5e5e5', text: '#525252', border: '#d4d4d4' }
  };
  const config = configs[normalized] || configs.DRAFT;
  const isSmall = size === 'small';

  return (
    <span
      className={`proposal-status-badge proposal-status-${normalized.toLowerCase()}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: isSmall ? '2px 7px' : '4px 10px',
        borderRadius: '999px',
        fontSize: isSmall ? '9px' : '10px',
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        backgroundColor: config.bg,
        color: config.text,
        border: `1px solid ${config.border}`,
        lineHeight: 1,
        whiteSpace: 'nowrap'
      }}
    >
      <span
        style={{
          width: isSmall ? '5px' : '6px',
          height: isSmall ? '5px' : '6px',
          borderRadius: '50%',
          backgroundColor: config.text,
          opacity: 0.85
        }}
      />
      {config.label}
    </span>
  );
}

export function ContractStatusBadge({ status, size = 'normal' }) {
  const normalized = (status || 'DRAFT').toUpperCase();
  const configs = {
    DRAFT: { label: 'DRAFT', bg: '#f4f1e9', text: '#68665e', border: '#d4d0c5' },
    SENT: { label: 'SENT', bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd' },
    ACCEPTED: { label: 'SIGNED', bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' },
    REJECTED: { label: 'DECLINED', bg: '#fee2e2', text: '#b91c1c', border: '#fecaca' }
  };
  const config = configs[normalized] || configs.DRAFT;
  const isSmall = size === 'small';

  return (
    <span
      className={`contract-status-badge contract-status-${normalized.toLowerCase()}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: isSmall ? '2px 7px' : '4px 10px',
        borderRadius: '999px',
        fontSize: isSmall ? '9px' : '10px',
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        backgroundColor: config.bg,
        color: config.text,
        border: `1px solid ${config.border}`,
        lineHeight: 1,
        whiteSpace: 'nowrap'
      }}
    >
      <span
        style={{
          width: isSmall ? '5px' : '6px',
          height: isSmall ? '5px' : '6px',
          borderRadius: '50%',
          backgroundColor: config.text,
          opacity: 0.85
        }}
      />
      {config.label}
    </span>
  );
}

export function InvoiceStatusBadge({ status, isOverdue = false, size = 'normal' }) {
  let normalized = (status || 'DRAFT').toUpperCase();
  if (isOverdue && normalized !== 'PAID' && normalized !== 'CANCELLED') {
    normalized = 'OVERDUE';
  }

  const configs = {
    DRAFT: { label: 'DRAFT', bg: '#f4f1e9', text: '#68665e', border: '#d4d0c5' },
    SENT: { label: 'SENT', bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd' },
    PARTIALLY_PAID: { label: 'PARTIAL', bg: '#fef3c7', text: '#b45309', border: '#fde68a' },
    PAID: { label: 'PAID', bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' },
    OVERDUE: { label: 'OVERDUE', bg: '#fee2e2', text: '#dc2626', border: '#fca5a5' },
    CANCELLED: { label: 'VOID', bg: '#e5e5e5', text: '#525252', border: '#d4d4d4' }
  };
  const config = configs[normalized] || configs.DRAFT;
  const isSmall = size === 'small';

  return (
    <span
      className={`invoice-status-badge invoice-status-${normalized.toLowerCase()}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: isSmall ? '2px 7px' : '4px 10px',
        borderRadius: '999px',
        fontSize: isSmall ? '9px' : '10px',
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        backgroundColor: config.bg,
        color: config.text,
        border: `1px solid ${config.border}`,
        lineHeight: 1,
        whiteSpace: 'nowrap'
      }}
    >
      <span
        style={{
          width: isSmall ? '5px' : '6px',
          height: isSmall ? '5px' : '6px',
          borderRadius: '50%',
          backgroundColor: config.text,
          opacity: 0.85
        }}
      />
      {config.label}
    </span>
  );
}

export function PaymentConfirmationStatusBadge({ status, size = 'normal' }) {
  const normalized = (status || 'PENDING_VERIFICATION').toUpperCase();
  const configs = {
    PENDING_VERIFICATION: { label: 'PENDING VERIFICATION', bg: '#fef3c7', text: '#b45309', border: '#fde68a' },
    CONFIRMED: { label: 'CONFIRMED', bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' },
    REJECTED: { label: 'REJECTED', bg: '#fee2e2', text: '#b91c1c', border: '#fecaca' }
  };
  const config = configs[normalized] || configs.PENDING_VERIFICATION;
  const isSmall = size === 'small';

  return (
    <span
      className={`confirmation-status-badge confirmation-status-${normalized.toLowerCase()}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: isSmall ? '2px 7px' : '4px 10px',
        borderRadius: '999px',
        fontSize: isSmall ? '9px' : '10px',
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        backgroundColor: config.bg,
        color: config.text,
        border: `1px solid ${config.border}`,
        lineHeight: 1,
        whiteSpace: 'nowrap'
      }}
    >
      <span
        style={{
          width: isSmall ? '5px' : '6px',
          height: isSmall ? '5px' : '6px',
          borderRadius: '50%',
          backgroundColor: config.text,
          opacity: 0.85
        }}
      />
      {config.label}
    </span>
  );
}
