import React from 'react';
import { Users, Wifi, Shield } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardBody } from '../ui/Card';
import { RoleBadge } from '../ui/Badge';
import { OnlineUser } from '../../types';

export function PresenceWidget({ onlineUsers = [] }: { onlineUsers?: OnlineUser[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Wifi className="h-4 w-4 text-emerald-500 animate-pulse" />
          <CardTitle>Users Online Now ({onlineUsers.length})</CardTitle>
        </div>
      </CardHeader>
      <CardBody className="p-0">
        {onlineUsers.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-400">
            No users online
          </div>
        ) : (
          <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
            {onlineUsers.map((u) => (
              <div key={u.userId} className="px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-xs">
                      {u.name.charAt(0)}
                    </div>
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">{u.name}</p>
                    <p className="text-[11px] text-gray-400">{u.email}</p>
                  </div>
                </div>
                <RoleBadge role={u.role} />
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
