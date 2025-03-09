import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from './ui/use-toast';
import { createRandomMailbox, createCustomMailbox } from '../utils/api';

interface HeaderMailboxProps {
  mailbox: Mailbox | null;
  onMailboxChange: (mailbox: Mailbox) => void;
  domain: string;
  isLoading: boolean;
}

const HeaderMailbox: React.FC<HeaderMailboxProps> = ({ 
  mailbox, 
  onMailboxChange,
  domain,
  isLoading
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customAddress, setCustomAddress] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);
  const [customAddressError, setCustomAddressError] = useState<string | null>(null);
  const [showRefreshSuccess, setShowRefreshSuccess] = useState(false);
  const copyTooltipTimeoutRef = useRef<number | null>(null);
  const refreshSuccessTimeoutRef = useRef<number | null>(null);
  
  // 清除提示的定时器
  useEffect(() => {
    return () => {
      if (copyTooltipTimeoutRef.current) {
        window.clearTimeout(copyTooltipTimeoutRef.current);
      }
      if (refreshSuccessTimeoutRef.current) {
        window.clearTimeout(refreshSuccessTimeoutRef.current);
      }
    };
  }, []);
  
  if (!mailbox || isLoading) return null;
  
  // 复制邮箱地址到剪贴板
  const copyToClipboard = () => {
    const fullAddress = mailbox.address.includes('@') ? mailbox.address : `${mailbox.address}@${domain}`;
    navigator.clipboard.writeText(fullAddress)
      .then(() => {
        // 显示复制成功提示
        setShowCopyTooltip(true);
        
        // 2秒后隐藏提示
        if (copyTooltipTimeoutRef.current) {
          window.clearTimeout(copyTooltipTimeoutRef.current);
        }
        copyTooltipTimeoutRef.current = window.setTimeout(() => {
          setShowCopyTooltip(false);
        }, 2000);
      })
      .catch(() => {
        toast({
          title: t('errors.generic'),
          description: t('mailbox.copyFailed'),
          variant: 'destructive',
        });
      });
  };
  
  // 更换随机邮箱
  const handleRefreshMailbox = async () => {
    setIsActionLoading(true);
    const result = await createRandomMailbox();
    setIsActionLoading(false);
    
    if (result.success && result.mailbox) {
      onMailboxChange(result.mailbox);
      
      // 显示更新成功提示
      setShowRefreshSuccess(true);
      
      // 3秒后隐藏提示
      if (refreshSuccessTimeoutRef.current) {
        window.clearTimeout(refreshSuccessTimeoutRef.current);
      }
      refreshSuccessTimeoutRef.current = window.setTimeout(() => {
        setShowRefreshSuccess(false);
      }, 3000);
    } else {
      toast({
        title: t('errors.generic'),
        description: t('mailbox.refreshFailed'),
        variant: 'destructive',
      });
    }
  };
  
  // 创建自定义邮箱
  const handleCreateCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 清除之前的错误信息
    setCustomAddressError(null);
    
    if (!customAddress.trim()) {
      setCustomAddressError(t('mailbox.invalidAddress'));
      return;
    }
    
    setIsActionLoading(true);
    const result = await createCustomMailbox(customAddress);
    setIsActionLoading(false);
    
    if (result.success && result.mailbox) {
      onMailboxChange(result.mailbox);
      setIsCustomMode(false);
      setCustomAddress('');
      toast({
        title: t('common.success'),
        description: t('mailbox.createSuccess'),
      });
    } else {
      // 检查错误信息是否包含"邮箱地址已存在"
      const isAddressExistsError = 
        result.error === 'Address already exists' || 
        String(result.error).includes('已存在');
      
      if (isAddressExistsError) {
        setCustomAddressError(t('mailbox.addressExists'));
      } else {
        toast({
          title: t('errors.generic'),
          description: t('mailbox.createFailed'),
          variant: 'destructive',
        });
      }
    }
  };
  
  // 取消自定义模式
  const handleCancelCustom = () => {
    setIsCustomMode(false);
    setCustomAddress('');
    setCustomAddressError(null);
  };
  
  // 移动设备上的邮箱地址显示
  const renderMobileAddress = () => {
    const fullAddress = mailbox.address.includes('@') ? mailbox.address : `${mailbox.address}@${domain}`;
    const [username, domainPart] = fullAddress.split('@');
    
    // 如果用户名太长，截断显示
    const displayUsername = username.length > 10 ? `${username.substring(0, 8)}...` : username;
    
    return (
      <code className="bg-muted px-2 py-1 rounded text-xs font-medium truncate max-w-[120px]">
        {displayUsername}@{domainPart}
      </code>
    );
  };
  
  // 按钮基础样式
  const buttonBaseClass = "flex items-center justify-center rounded-md transition-all duration-200";
  const copyButtonClass = `${buttonBaseClass} hover:bg-primary/20 hover:text-primary hover:scale-110 mx-1`;
  const refreshButtonClass = `${buttonBaseClass} bg-muted hover:bg-primary/20 hover:text-primary hover:scale-110 mr-1`;
  const customizeButtonClass = `${buttonBaseClass} bg-primary text-primary-foreground hover:bg-primary/80 hover:scale-110`;
  
  return (
    <div className="flex items-center">
      {isCustomMode ? (
        <form onSubmit={handleCreateCustom} className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <input
                type="text"
                value={customAddress}
                onChange={(e) => {
                  setCustomAddress(e.target.value);
                  if (customAddressError) setCustomAddressError(null);
                }}
                className={`w-32 md:w-40 px-2 py-1 text-sm border rounded-l-md focus:outline-none focus:ring-1 focus:ring-primary ${
                  customAddressError ? 'border-red-500' : ''
                }`}
                placeholder={t('mailbox.customAddressPlaceholder')}
                disabled={isActionLoading}
                autoFocus
              />
              <span className="px-2 py-1 text-sm border-y border-r rounded-r-md bg-muted">
                @{domain}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCancelCustom}
              className="px-2 py-1 text-sm rounded-md bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
              disabled={isActionLoading}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="px-2 py-1 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/80 transition-colors"
              disabled={isActionLoading}
            >
              {isActionLoading ? t('common.loading') : t('common.create')}
            </button>
          </div>
          
          {/* 错误信息显示 */}
          {customAddressError && (
            <div className="text-red-500 text-xs px-1">
              {customAddressError}
            </div>
          )}
        </form>
      ) : (
        <>
          {/* 桌面版显示 */}
          <div className="hidden md:flex items-center">
            {/* 邮箱地址和操作按钮 */}
            <div className="flex items-center">
              <code className="px-3 py-1.5 text-sm font-medium">
                {mailbox.address.includes('@') ? mailbox.address : `${mailbox.address}@${domain}`}
              </code>
              
              <div className="relative">
                <button
                  onClick={copyToClipboard}
                  className={`w-8 h-8 ${copyButtonClass}`}
                  aria-label={t('common.copy')}
                  title={t('common.copy')}
                >
                  <i className="fas fa-copy text-sm"></i>
                </button>
                
                {/* 复制成功提示 */}
                {showCopyTooltip && (
                  <div className="absolute top-9 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-xs py-1 px-2 rounded shadow-lg whitespace-nowrap z-10">
                    {t('mailbox.copySuccess')}
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-primary rotate-45"></div>
                  </div>
                )}
              </div>
              
              <div className="relative">
                <button
                  onClick={handleRefreshMailbox}
                  className={`w-8 h-8 ${refreshButtonClass}`}
                  disabled={isActionLoading}
                  title={t('mailbox.refresh')}
                >
                  <i className="fas fa-sync-alt text-sm"></i>
                </button>
                
                {/* 更新成功提示 */}
                {showRefreshSuccess && (
                  <div className="absolute top-9 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-xs py-1 px-2 rounded shadow-lg whitespace-nowrap z-10">
                    {t('mailbox.refreshSuccess')}
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-primary rotate-45"></div>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setIsCustomMode(true)}
                className={`w-8 h-8 ${customizeButtonClass}`}
                disabled={isActionLoading}
                title={t('mailbox.customize')}
              >
                <i className="fas fa-edit text-sm"></i>
              </button>
            </div>
          </div>
          
          {/* 移动版显示 */}
          <div className="flex md:hidden items-center">
            {/* 邮箱地址和操作按钮 */}
            <div className="flex items-center">
              {renderMobileAddress()}
              
              <div className="relative">
                <button
                  onClick={copyToClipboard}
                  className={`w-6 h-6 ${copyButtonClass}`}
                  aria-label={t('common.copy')}
                  title={t('common.copy')}
                >
                  <i className="fas fa-copy text-xs"></i>
                </button>
                
                {/* 复制成功提示 */}
                {showCopyTooltip && (
                  <div className="absolute top-7 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-xs py-1 px-2 rounded shadow-lg whitespace-nowrap z-10">
                    {t('mailbox.copySuccess')}
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-primary rotate-45"></div>
                  </div>
                )}
              </div>
              
              <div className="relative">
                <button
                  onClick={handleRefreshMailbox}
                  className={`w-6 h-6 ${refreshButtonClass}`}
                  disabled={isActionLoading}
                  title={t('mailbox.refresh')}
                >
                  <i className="fas fa-sync-alt text-xs"></i>
                </button>
                
                {/* 更新成功提示 */}
                {showRefreshSuccess && (
                  <div className="absolute top-7 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-xs py-1 px-2 rounded shadow-lg whitespace-nowrap z-10">
                    {t('mailbox.refreshSuccess')}
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-primary rotate-45"></div>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setIsCustomMode(true)}
                className={`w-6 h-6 ${customizeButtonClass}`}
                disabled={isActionLoading}
                title={t('mailbox.customize')}
              >
                <i className="fas fa-edit text-xs"></i>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HeaderMailbox; 