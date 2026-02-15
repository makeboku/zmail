import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface MailboxInfoProps {
  mailbox: Mailbox;
  onDelete: () => void;
  autoRefresh: boolean;
  onToggleAutoRefresh: () => void;
}

const MailboxInfo: React.FC<MailboxInfoProps> = ({ 
  mailbox, 
  onDelete,
  autoRefresh,
  onToggleAutoRefresh
}) => {
  const { t } = useTranslation();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };
  
  const calculateTimeLeft = (expiresAt: number) => {
    const now = Math.floor(Date.now() / 1000);
    const timeLeftSeconds = expiresAt - now;
    
    if (timeLeftSeconds <= 0) {
      return t('mailbox.expired');
    }
    
    const hours = Math.floor(timeLeftSeconds / 3600);
    const minutes = Math.floor((timeLeftSeconds % 3600) / 60);
    
    if (hours > 0) {
      return t('mailbox.expiresInTime', { hours, minutes });
    } else {
      return t('mailbox.expiresInMinutes', { minutes });
    }
  };
  

  
  return (
    <div className="border rounded-lg p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
        <div className="flex mt-4 md:mt-0 space-x-2">
          <button
            onClick={onToggleAutoRefresh}
            className={`px-3 py-1 rounded-md ${
              autoRefresh 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {autoRefresh ? t('email.autoRefreshOn') : t('email.autoRefreshOff')}
          </button>
          
          {showDeleteConfirm ? (
            <>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1 rounded-md bg-muted"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={onDelete}
                className="px-3 py-1 rounded-md bg-destructive text-destructive-foreground"
              >
                {t('common.confirm')}
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-3 py-1 rounded-md bg-destructive text-destructive-foreground"
            >
              {t('common.delete')}
            </button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">{t('mailbox.created')}</p>
          <p>{formatDate(mailbox.createdAt)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">{t('mailbox.expiresAt')}</p>
          <p>{formatDate(mailbox.expiresAt)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">{t('mailbox.timeLeft')}</p>
          <p>{calculateTimeLeft(mailbox.expiresAt)}</p>
        </div>
      </div>
    </div>
  );
};

export default MailboxInfo; 