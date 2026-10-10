/**
 * Image Processing Utilities for Employee Photos, License, and Certificates.
 * Automatically downscales and compresses uploaded files into base64 Data URLs
 * suitable for SQLite / Turso database persistence.
 */

export async function fileToBase64(
  file: File,
  maxWidth = 1000,
  maxHeight = 1000,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image'));
      img.onload = () => {
        // Calculate aspect-ratio preserved dimensions
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            maxHeight = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Convert to compressed jpeg data url
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export const PRESET_AVATARS = [
  {
    label: 'Lead Engineer (Male)',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  },
  {
    label: 'HR Director (Female)',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
  },
  {
    label: 'Finance Specialist (Female)',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
  },
  {
    label: 'Operations Manager (Male)',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  },
  {
    label: 'Talent Acquisition (Female)',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
  },
  {
    label: 'Senior Architect (Male)',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  },
];

// Verified high-resolution employee portrait mapping by ID
export const DEFAULT_EMPLOYEE_AVATARS: Record<string, string> = {
  'NX-1001': '/images/avatar_hr_director_1791292459721.jpg',
  'NX-1002': '/images/avatar_lead_engineer_1791292472793.jpg',
  'NX-1003': '/images/avatar_ops_manager_1791292482743.jpg',
  'NX-1004': 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
  'NX-1005': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
};

// Fallback high-res executive headshots (avoids initials fallback on production)
export const FALLBACK_HEADSHOTS: string[] = [
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
];

/**
 * Resolves an employee photo URL reliably across Vercel production, Turso Cloud sync, and localhost.
 */
export function getEmployeeAvatar(emp?: {
  avatar?: string;
  employeeId?: string;
  name?: string;
  role?: string;
  gender?: string;
}): string {
  if (!emp) return FALLBACK_HEADSHOTS[0];

  const raw = emp.avatar?.trim();

  // 1. If base64 uploaded photo, return it directly
  if (raw && raw.startsWith('data:image/')) {
    return raw;
  }

  // 2. If valid external HTTP/HTTPS URL and NOT broken dicebear initials
  if (raw && (raw.startsWith('http://') || raw.startsWith('https://'))) {
    if (!raw.includes('api.dicebear.com/7.x/initials')) {
      return raw;
    }
  }

  // 3. If it's a known employee ID with pre-mapped portrait
  if (emp.employeeId && DEFAULT_EMPLOYEE_AVATARS[emp.employeeId]) {
    return DEFAULT_EMPLOYEE_AVATARS[emp.employeeId];
  }

  // 4. If path starts with /src/assets/images/, convert to public /images/
  if (raw && raw.startsWith('/src/assets/images/')) {
    return raw.replace('/src/assets/images/', '/images/');
  }
  if (raw && raw.startsWith('/images/')) {
    return raw;
  }

  // 5. Deterministic fallback headshot by employee name or ID hash
  const seed = (emp.employeeId || emp.name || 'NX')
    .split('')
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return FALLBACK_HEADSHOTS[seed % FALLBACK_HEADSHOTS.length];
}

/**
 * Handles image load errors gracefully by switching to a reliable high-res corporate portrait.
 */
export function handleAvatarError(
  e: React.SyntheticEvent<HTMLImageElement>,
  emp?: { employeeId?: string; name?: string }
): void {
  const target = e.currentTarget;
  if (target.dataset.triedFallback === 'true') {
    return;
  }
  target.dataset.triedFallback = 'true';

  const empId = emp?.employeeId || '';
  if (empId && DEFAULT_EMPLOYEE_AVATARS[empId]) {
    target.src = DEFAULT_EMPLOYEE_AVATARS[empId];
  } else {
    const seed = (emp?.name || empId || 'avatar')
      .split('')
      .reduce((acc, c) => acc + c.charCodeAt(0), 0);
    target.src = FALLBACK_HEADSHOTS[seed % FALLBACK_HEADSHOTS.length];
  }
}

