

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return formatDate(date);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}





// import { clsx, type ClassValue } from "clsx"
// import { twMerge } from "tailwind-merge"

// export function cn(...inputs: ClassValue[]) {
//   return twMerge(clsx(inputs))
// }

// // Format relative time (e.g., "2 hours ago", "3 days ago")
// export function formatRelativeTime(date: Date | string): string {
//   const now = new Date()
//   const targetDate = typeof date === 'string' ? new Date(date) : date
//   const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000)

//   if (diffInSeconds < 60) {
//     return 'just now'
//   }

//   const diffInMinutes = Math.floor(diffInSeconds / 60)
//   if (diffInMinutes < 60) {
//     return diffInMinutes === 1 ? '1 minute ago' : `${diffInMinutes} minutes ago`
//   }

//   const diffInHours = Math.floor(diffInMinutes / 60)
//   if (diffInHours < 24) {
//     return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`
//   }

//   const diffInDays = Math.floor(diffInHours / 24)
//   if (diffInDays < 7) {
//     return diffInDays === 1 ? '1 day ago' : `${diffInDays} days ago`
//   }

//   const diffInWeeks = Math.floor(diffInDays / 7)
//   if (diffInWeeks < 4) {
//     return diffInWeeks === 1 ? '1 week ago' : `${diffInWeeks} weeks ago`
//   }

//   const diffInMonths = Math.floor(diffInDays / 30)
//   if (diffInMonths < 12) {
//     return diffInMonths === 1 ? '1 month ago' : `${diffInMonths} months ago`
//   }

//   const diffInYears = Math.floor(diffInDays / 365)
//   return diffInYears === 1 ? '1 year ago' : `${diffInYears} years ago`
// }

// // Truncate text to specified length
// export function truncateText(text: string, maxLength: number): string {
//   if (text.length <= maxLength) return text
//   return text.slice(0, maxLength).trim() + '...'
// }

// // Format file size
// export function formatFileSize(bytes: number): string {
//   if (bytes === 0) return '0 Bytes'
  
//   const k = 1024
//   const sizes = ['Bytes', 'KB', 'MB', 'GB']
//   const i = Math.floor(Math.log(bytes) / Math.log(k))
  
//   return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
// }

// // Get initials from name
// export function getInitials(name: string): string {
//   return name
//     .split(' ')
//     .map(part => part.charAt(0).toUpperCase())
//     .join('')
//     .slice(0, 2)
// }

// // Capitalize first letter
// export function capitalize(str: string): string {
//   return str.charAt(0).toUpperCase() + str.slice(1)
// }

// // Generate random ID
// export function generateId(length: number = 8): string {
//   const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
//   let result = ''
//   for (let i = 0; i < length; i++) {
//     result += chars.charAt(Math.floor(Math.random() * chars.length))
//   }
//   return result
// }

// // Validate email
// export function isValidEmail(email: string): boolean {
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
//   return emailRegex.test(email)
// }

// // Format currency
// export function formatCurrency(amount: number, currency: string = '₹'): string {
//   return `${currency}${amount.toLocaleString('en-IN')}`
// }

// // Deep clone object
// export function deepClone<T>(obj: T): T {
//   return JSON.parse(JSON.stringify(obj))
// }
