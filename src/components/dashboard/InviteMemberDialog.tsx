import { useState } from 'react';
import { Users, Plus, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useInviteTeamMember, useServers } from '@/hooks/useSymoneData';
import type { TeamMember } from '@/lib/types';

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const roles: { value: TeamMember['role']; label: string; description: string }[] = [
  { value: 'admin', label: 'Admin', description: 'Full access except billing' },
  { value: 'member', label: 'Member', description: 'Deploy and manage servers' },
  { value: 'viewer', label: 'Viewer', description: 'Read-only access' },
];

export const InviteMemberDialog = ({ open, onOpenChange }: InviteMemberDialogProps) => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<TeamMember['role']>('member');
  const [selectedServers, setSelectedServers] = useState<string[]>([]);

  const { data: servers = [] } = useServers();
  const inviteMember = useInviteTeamMember();

  const handleSubmit = async () => {
    if (!email.trim() || !firstName.trim()) return;

    const initials = (firstName[0] || '' + lastName[0] || '').toUpperCase();

    await inviteMember.mutateAsync({
      name: `${firstName} ${lastName}`.trim(),
      firstName: firstName,
      lastName: lastName,
      email,
      role,
      avatar: initials,
      serverAccess: selectedServers,
    });

    // Reset and close
    setEmail('');
    setFirstName('');
    setLastName('');
    setRole('member');
    setSelectedServers([]);
    onOpenChange(false);
  };

  const toggleServer = (id: string) => {
    setSelectedServers(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Invite Team Member
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Jane"
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Smith"
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@company.com"
                className="w-full pl-10 pr-3 py-2 rounded-lg bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Role</label>
            <div className="grid grid-cols-3 gap-2">
              {roles.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={`p-3 rounded-lg border text-left transition-colors ${role === r.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                    }`}
                >
                  <p className="font-medium text-foreground text-sm">{r.label}</p>
                  <p className="text-xs text-muted-foreground">{r.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Server Access</label>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {servers.map((server) => (
                <button
                  key={server.id}
                  type="button"
                  onClick={() => toggleServer(server.id)}
                  className={`p-2 rounded-lg border text-left text-sm transition-colors ${selectedServers.includes(server.id)
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                    }`}
                >
                  {server.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              variant="hero"
              onClick={handleSubmit}
              disabled={!email.trim() || !firstName.trim() || inviteMember.isPending}
              className="flex-1"
            >
              {inviteMember.isPending ? 'Sending...' : 'Send Invite'}
              <Plus className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
