import React from 'react';
import { 
  LayoutDashboard, 
  UploadCloud, 
  Library, 
  BookOpen, 
  User, 
  Settings, 
  LogOut,
  Plus,
  MoreVertical,
  Trash2,
  Search,
  Loader2,
  FileText,
  CheckCircle2,
  XCircle,
  Menu,
  X,
  ChevronRight,
  BrainCircuit,
  Check
} from 'lucide-react';

// Custom icon: Magnifying glass with checkmark
const SearchCheck: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Magnifying glass */}
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
      {/* Checkmark inside */}
      <path d="M8 11l2 2 4-4" strokeWidth="2.5" />
    </svg>
  );
};

export const Icons = {
  Dashboard: LayoutDashboard,
  Upload: UploadCloud,
  Decks: Library,
  Study: BookOpen,
  Profile: User,
  Settings: Settings,
  Logout: LogOut,
  Plus: Plus,
  More: MoreVertical,
  Delete: Trash2,
  Search: Search,
  Spinner: Loader2,
  File: FileText,
  Check: CheckCircle2,
  Error: XCircle,
  Menu: Menu,
  Close: X,
  ChevronRight: ChevronRight,
  Logo: BrainCircuit,
  SearchCheck: SearchCheck
};
