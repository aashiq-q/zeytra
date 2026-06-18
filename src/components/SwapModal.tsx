import React, { useState } from 'react';
import { X, ArrowDown } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import styles from './SwapModal.module.css';

interface SwapModalProps {
  onClose: () => void;
}

export const SwapModal: React.FC<SwapModalProps> = ({ onClose }) => {
  const [amount, setAmount] = useState('');
  const { showToast } = useToast();

  const handleSwap = () => {
    showToast(`Successfully swapped ${amount} USDT!`);
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Swap Assets</h3>
          <button className={styles.closeButton} onClick={onClose}><X size={20} /></button>
        </div>
        <div className={styles.content}>
          <div className={styles.inputGroup}>
            <label>You pay</label>
            <div className={styles.inputRow}>
              <input 
                type="number" 
                placeholder="0.0" 
                value={amount} 
                onChange={e => setAmount(e.target.value)} 
              />
              <button className={styles.tokenSelect}>USDT</button>
            </div>
          </div>
          
          <div className={styles.arrowContainer}>
            <div className={styles.arrowIcon}><ArrowDown size={16} /></div>
          </div>
          
          <div className={styles.inputGroup}>
            <label>You receive</label>
            <div className={styles.inputRow}>
              <input 
                type="number" 
                placeholder="0.0" 
                readOnly 
                value={amount ? (parseFloat(amount) * 0.99).toFixed(4) : ''} 
              />
              <button className={styles.tokenSelect}>BTC</button>
            </div>
          </div>
          
          <button 
            className={styles.swapButton} 
            onClick={handleSwap}
            disabled={!amount || parseFloat(amount) <= 0}
            style={{ opacity: !amount || parseFloat(amount) <= 0 ? 0.5 : 1 }}
          >
            Confirm Swap
          </button>
        </div>
      </div>
    </div>
  );
};
