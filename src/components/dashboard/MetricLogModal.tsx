import { BaseModal } from '@/components/common';
import { DayEditor } from './DayEditor';

interface MetricLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenHelp: () => void;
  closeOnEscape?: boolean;
}

export const MetricLogModal = ({ isOpen, onClose, onOpenHelp, closeOnEscape }: MetricLogModalProps) => (
  <BaseModal isOpen={isOpen} onClose={onClose} title="Log metrics" maxWidth="md" closeOnEscape={closeOnEscape}>
    <DayEditor variant="log" onOpenHelp={onOpenHelp} onSaved={onClose} />
  </BaseModal>
);
