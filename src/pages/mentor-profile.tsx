import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGetMentorsQuery, useGetMentorBuddiesQuery } from '@/api/apiSlice';
import { useRoute } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import BuddyCard from '@/components/BuddyCard';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { ArrowLeft, MessageCircle, Edit, Plus } from 'lucide-react';
import { useLocation } from 'wouter';
import AssignBuddyModal from '@/components/AssignBuddyModal';
import EditMentorModal from '@/components/EditMentorModal';
import MessageModal from '@/components/MessageModal';

export default function MentorProfilePage() {
  const [, params] = useRoute('/mentors/:id');
  const [, setLocation] = useLocation();
  const mentorId = params?.id;

  const [statusFilter, setStatusFilter] = useState('all');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

  const { data: mentors = [], isLoading: mentorLoading } = useGetMentorsQuery();
  const mentor = mentors.find((m: unknown) => (m as { id: string }).id === mentorId) || null;
  
  const { data: assignedBuddies = [], isLoading: buddiesLoading } = useGetMentorBuddiesQuery(
    { 
      mentorId: mentorId || '',
      status: statusFilter === 'all' ? undefined : statusFilter
    },
    { skip: !mentorId }
  );

  if (mentorLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Mentor not found</p>
          <Button onClick={() => setLocation('/mentors')} className="mt-4">
            Back to Mentors
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => setLocation('/mentors')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Mentors
        </Button>

        {/* Mentor Profile Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex items-start space-x-6">
                <Avatar className="w-20 h-20 flex-shrink-0">
                  <AvatarImage src={mentor.user?.avatarUrl} alt={mentor.user?.name} />
                  <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                    {mentor.user?.name?.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold mb-1">{mentor.user?.name}</h1>

                  {/* Email */}
                  <p className="text-sm text-muted-foreground mb-2">{mentor.user?.email || 'No email'}</p>

                  {/* Domain Role */}
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20 mb-3">
                    {mentor.user?.domainRole?.charAt(0).toUpperCase() + mentor.user?.domainRole?.slice(1) || 'No domain'}
                  </div>

                  {/* Expertise */}
                  {mentor.expertise && (
                    <p className="text-sm text-muted-foreground mt-2">{mentor.expertise}</p>
                  )}

                  {/* Status Badge */}
                  <div className="mt-3">
                    <Badge variant={mentor.isActive ? "default" : "secondary"} className="text-xs">
                      {mentor.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 flex-shrink-0">
                <Button onClick={() => setIsMessageModalOpen(true)} size="sm">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message
                </Button>
                <Button variant="outline" onClick={() => setIsEditModalOpen(true)} size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>

            {/* Stats Row - Calculated from actual data */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
              <div className="text-center px-3 py-2 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold">{assignedBuddies.length}</p>
                <p className="text-xs text-muted-foreground">Total Buddies</p>
              </div>
              <div className="text-center px-3 py-2 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{assignedBuddies.filter((b: any) => b.status === 'active').length}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
              <div className="text-center px-3 py-2 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{assignedBuddies.filter((b: any) => b.status === 'inactive').length}</p>
                <p className="text-xs text-muted-foreground">Inactive</p>
              </div>
              <div className="text-center px-3 py-2 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">{assignedBuddies.filter((b: any) => b.status === 'exited').length}</p>
                <p className="text-xs text-muted-foreground">Exited</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filter for Buddies */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
          <div>
            <h2 className="text-lg font-semibold">Assigned Buddies</h2>
            <p className="text-sm text-muted-foreground">
              Showing {assignedBuddies.length} {assignedBuddies.length === 1 ? 'buddy' : 'buddies'}
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="exited">Exited</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setIsAssignModalOpen(true)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Assign Buddy
            </Button>
          </div>
        </div>

        {/* Buddy Cards */}
        {buddiesLoading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <LoadingSpinner />
          </div>
        ) : assignedBuddies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {assignedBuddies.map((buddy: unknown) => (
              <BuddyCard key={buddy.id} buddy={buddy} showMentor={false} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-muted-foreground">
                <p className="text-base font-medium mb-1">No buddies assigned</p>
                <p className="text-sm">
                  {statusFilter !== 'all'
                    ? 'Try changing the status filter or assign a new buddy'
                    : 'Click "Assign Buddy" to get started'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Modals */}
      <AssignBuddyModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        mentorId={mentorId || ''}
        mentorName={mentor?.user?.name || 'Mentor'}
      />

      <EditMentorModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        mentor={mentor}
      />

      <MessageModal
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        recipient={{
          id: mentorId || '',
          name: mentor?.user?.name || 'Mentor',
          avatarUrl: mentor?.user?.avatarUrl,
          role: 'mentor',
          domainRole: mentor?.user?.domainRole || 'unknown'
        }}
      />
    </div>
  );
}
