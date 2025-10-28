import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  useUpdateProfileMutation,
  useUpdatePreferencesMutation,
  useUpdatePrivacySettingsMutation,
  useChangePasswordMutation,
  useDeleteAccountMutation,
  useExportUserDataQuery
} from '@/api/apiSlice';
import { 
  Settings as SettingsIcon, 
  User, 
  Shield, 
  Bell, 
  Palette, 
  Crown, 
  Sparkles, 
  Camera, 
  Upload,
  Eye,
  EyeOff,
  Save,
  Download,
  Trash2,
  Globe,
  Lock,
  Smartphone,
  Mail,
  Calendar,
  Clock
} from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme, themes } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // API mutations
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();
  const [updatePreferences, { isLoading: isUpdatingPreferences }] = useUpdatePreferencesMutation();
  const [, { isLoading: isUpdatingPrivacy }] = useUpdatePrivacySettingsMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();
  const [deleteAccount, { isLoading: isDeletingAccount }] = useDeleteAccountMutation();
  
  const isLoading = isUpdatingProfile || isUpdatingPreferences || isUpdatingPrivacy || isChangingPassword || isDeletingAccount;
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    domainRole: user?.domainRole || '',
    bio: (user as unknown as { bio?: string })?.bio || '',
    avatarUrl: (user as unknown as { avatarUrl?: string })?.avatarUrl || '',
    timezone: 'UTC',
    language: 'en',
    phoneNumber: (user as unknown as { phoneNumber?: string })?.phoneNumber || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: false,
    marketingEmails: false,
    securityAlerts: true,
    taskReminders: true,
    mentorUpdates: true,
    systemNotifications: true,
    soundEnabled: true,
    desktopNotifications: true
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    allowDirectMessages: true,
    showOnlineStatus: true
  });

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      // TODO: Implement avatar upload API
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData({ ...profileData, avatarUrl: e.target?.result as string });
      };
      reader.readAsDataURL(file);
      
      toast({
        title: "Avatar Updated",
        description: "Your profile photo has been updated successfully.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      // Prepare update data (exclude unchanged fields)
      const updateData: Record<string, unknown> = {};
      if (profileData.name !== user?.name) updateData.name = profileData.name;
      if (profileData.bio !== (user as unknown as { bio?: string })?.bio) updateData.bio = profileData.bio;
      if (profileData.phoneNumber !== (user as unknown as { phoneNumber?: string })?.phoneNumber) updateData.phoneNumber = profileData.phoneNumber;
      if (profileData.timezone !== (user as unknown as { timezone?: string })?.timezone) updateData.timezone = profileData.timezone;
      if (profileData.avatarUrl !== (user as unknown as { avatarUrl?: string })?.avatarUrl) updateData.avatarUrl = profileData.avatarUrl;

      if (Object.keys(updateData).length === 0) {
        toast({
          title: "No Changes",
          description: "No changes were made to your profile.",
        });
        return;
      }

      await updateProfile(updateData).unwrap();
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: (error as { data?: { message?: string } })?.data?.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill in all password fields.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "New password and confirmation must match.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    try {
      await changePassword(passwordData).unwrap();
      
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast({
        title: "Password Changed",
        description: "Your password has been changed successfully.",
      });
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: (error as { data?: { message?: string } })?.data?.message || "Failed to change password. Please check your current password and try again.",
        variant: "destructive",
      });
    }
  };

  const handlePreferencesUpdate = async () => {
    try {
      await updatePreferences(preferences).unwrap();
      toast({
        title: "Preferences Updated",
        description: "Your preferences have been updated successfully.",
      });
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: (error as { data?: { message?: string } })?.data?.message || "Failed to update preferences. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Get the export query hook
  const { refetch: triggerExport } = useExportUserDataQuery(undefined, { skip: true });

  const handleExportData = async () => {
    try {
      // Trigger the query manually
      const { data } = await triggerExport();
      
      if (data) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mentor-buddy-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast({
          title: "Data Exported",
          description: "Your data has been exported successfully.",
        });
      }
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: (error as { data?: { message?: string } })?.data?.message || "Failed to export data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
    if (!confirmed) return;

    try {
      await deleteAccount().unwrap();
      toast({
        title: "Account Deleted",
        description: "Your account has been scheduled for deletion.",
      });
      
      // Optionally redirect to login page
      // setLocation('/auth');
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: (error as { data?: { message?: string } })?.data?.message || "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="min-h-dvh p-6 space-y-8">
      {/* Premium Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="premium-card glass-card mb-8"
      >
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mt-1">
            <SettingsIcon className="w-6 h-6 text-foreground" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <p className="text-muted-foreground">Manage your account settings and preferences</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Hidden file input for avatar upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarChange}
        className="hidden"
      />

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Profile Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="premium-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Profile Settings</h3>
                <p className="text-muted-foreground text-sm">Update your personal information and profile</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="relative group">
                  {profileData.avatarUrl ? (
                    <img
                      src={profileData.avatarUrl}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover ring-2 ring-border"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gradient-to-br from-muted to-card rounded-full flex items-center justify-center ring-2 ring-border">
                      <span className="text-2xl font-bold text-foreground">
                        {profileData.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  )}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Camera className="w-6 h-6 text-white" />
                  </button>
                </div>
                <div className="space-y-2">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="btn-gradient text-sm"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Change Avatar
                  </button>
                  <p className="text-xs text-muted-foreground">JPG, PNG or GIF (max 5MB)</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="name" className="form-label">Full Name</label>
                  <input
                    id="name"
                    className="input-premium"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="form-label">Phone Number</label>
                  <input
                    id="phone"
                    type="tel"
                    className="input-premium"
                    value={profileData.phoneNumber}
                    onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  id="email"
                  type="email"
                  className="input-premium opacity-50 cursor-not-allowed"
                  value={profileData.email}
                  autoComplete="email"
                  disabled
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="domainRole" className="form-label">Domain Role</label>
                  <Select
                    value={profileData.domainRole}
                    onValueChange={(value) => setProfileData({ ...profileData, domainRole: value })}
                  >
                    <SelectTrigger className="input-premium">
                      <SelectValue placeholder="Select your domain role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="frontend">Frontend Developer</SelectItem>
                      <SelectItem value="backend">Backend Developer</SelectItem>
                      <SelectItem value="fullstack">Full Stack Developer</SelectItem>
                      <SelectItem value="devops">DevOps Engineer</SelectItem>
                      <SelectItem value="qa">QA Engineer</SelectItem>
                      <SelectItem value="design">UI/UX Designer</SelectItem>
                      <SelectItem value="pm">Product Manager</SelectItem>
                      <SelectItem value="hr">HR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="timezone" className="form-label">Timezone</label>
                  <Select
                    value={profileData.timezone}
                    onValueChange={(value) => setProfileData({ ...profileData, timezone: value })}
                  >
                    <SelectTrigger className="input-premium">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                      <SelectItem value="EST">Eastern Time (GMT-5)</SelectItem>
                      <SelectItem value="PST">Pacific Time (GMT-8)</SelectItem>
                      <SelectItem value="IST">India Standard Time (GMT+5:30)</SelectItem>
                      <SelectItem value="JST">Japan Standard Time (GMT+9)</SelectItem>
                      <SelectItem value="CET">Central European Time (GMT+1)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="bio" className="form-label">Bio</label>
                <textarea
                  id="bio"
                  className="input-premium"
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
              </div>

              <button onClick={handleProfileUpdate} disabled={isLoading} className="btn-gradient w-full">
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Theme & Appearance */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="premium-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                <Palette className="w-4 h-4 text-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Theme & Appearance</h3>
                <p className="text-muted-foreground text-sm">Customize your visual experience</p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="space-y-4">
                <label className="form-label">Choose Theme</label>
                <div className="grid gap-3">
                  {themes.map((themeOption) => (
                    <div
                      key={themeOption.value}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        theme === themeOption.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-border-hover'
                      }`}
                      onClick={() => setTheme(themeOption.value)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-foreground">{themeOption.label}</div>
                          <div className="text-sm text-muted-foreground">{themeOption.description}</div>
                        </div>
                        <div className="flex space-x-1">
                          {themeOption.value === 'dark' && (
                            <>
                              <div className="w-4 h-4 rounded-full bg-gray-900 border border-gray-700"></div>
                              <div className="w-4 h-4 rounded-full bg-gray-100 border border-gray-300"></div>
                            </>
                          )}
                          {themeOption.value === 'navy' && (
                            <>
                              <div className="w-4 h-4 rounded-full bg-slate-900 border border-slate-700"></div>
                              <div className="w-4 h-4 rounded-full bg-blue-500 border border-blue-400"></div>
                            </>
                          )}
                          {themeOption.value === 'light' && (
                            <>
                              <div className="w-4 h-4 rounded-full bg-white border border-gray-300"></div>
                              <div className="w-4 h-4 rounded-full bg-gray-800 border border-gray-600"></div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="form-label">Sound Notifications</label>
                    <p className="text-xs text-muted-foreground mt-1">Play sounds for notifications</p>
                  </div>
                  <Switch
                    checked={preferences.soundEnabled}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, soundEnabled: checked })}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Notifications & Privacy */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="premium-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                <Bell className="w-4 h-4 text-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Notifications</h3>
                <p className="text-muted-foreground text-sm">Manage your notification preferences</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <label className="form-label">Email Notifications</label>
                    <p className="text-xs text-muted-foreground mt-1">Receive email updates about your activities</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.emailNotifications}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, emailNotifications: checked })}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <label className="form-label">Push Notifications</label>
                    <p className="text-xs text-muted-foreground mt-1">Receive push notifications in your browser</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.pushNotifications}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, pushNotifications: checked })}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <label className="form-label">Weekly Reports</label>
                    <p className="text-xs text-muted-foreground mt-1">Receive weekly progress reports</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.weeklyReports}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, weeklyReports: checked })}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <label className="form-label">Task Reminders</label>
                    <p className="text-xs text-muted-foreground mt-1">Get reminded about upcoming tasks</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.taskReminders}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, taskReminders: checked })}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <label className="form-label">Mentor Updates</label>
                    <p className="text-xs text-muted-foreground mt-1">Notifications about mentor activities</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.mentorUpdates}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, mentorUpdates: checked })}
                />
              </div>

              <button onClick={handlePreferencesUpdate} disabled={isLoading} className="btn-gradient w-full mt-6">
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Updating...' : 'Update Preferences'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Privacy Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="premium-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                <Globe className="w-4 h-4 text-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Privacy Settings</h3>
                <p className="text-muted-foreground text-sm">Control your privacy and visibility</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="profileVisibility" className="form-label">Profile Visibility</label>
                <Select
                  value={privacySettings.profileVisibility}
                  onValueChange={(value) => setPrivacySettings({ ...privacySettings, profileVisibility: value })}
                >
                  <SelectTrigger className="input-premium">
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public - Everyone can see</SelectItem>
                    <SelectItem value="team">Team Only - Only team members</SelectItem>
                    <SelectItem value="private">Private - Only me</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <label className="form-label">Show Email Address</label>
                  <p className="text-xs text-muted-foreground mt-1">Display email on your profile</p>
                </div>
                <Switch
                  checked={privacySettings.showEmail}
                  onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, showEmail: checked })}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <label className="form-label">Show Phone Number</label>
                  <p className="text-xs text-muted-foreground mt-1">Display phone on your profile</p>
                </div>
                <Switch
                  checked={privacySettings.showPhone}
                  onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, showPhone: checked })}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <label className="form-label">Allow Direct Messages</label>
                  <p className="text-xs text-muted-foreground mt-1">Let others send you direct messages</p>
                </div>
                <Switch
                  checked={privacySettings.allowDirectMessages}
                  onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, allowDirectMessages: checked })}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <label className="form-label">Show Online Status</label>
                  <p className="text-xs text-muted-foreground mt-1">Display when you're online</p>
                </div>
                <Switch
                  checked={privacySettings.showOnlineStatus}
                  onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, showOnlineStatus: checked })}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Security Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className="premium-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-foreground" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">Security Settings</h3>
              <p className="text-muted-foreground text-sm">Manage your account security and password</p>
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="currentPassword" className="form-label">Current Password</label>
                <div className="relative">
                  <input
                    id="currentPassword"
                    type={showPasswords.current ? 'text' : 'password'}
                    className="input-premium pr-10"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="Enter your current password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="newPassword" className="form-label">New Password</label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showPasswords.new ? 'text' : 'password'}
                    className="input-premium pr-10"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Enter your new password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showPasswords.confirm ? 'text' : 'password'}
                    className="input-premium pr-10"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Confirm your new password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button onClick={handlePasswordChange} disabled={isLoading} className="btn-gradient w-full">
                <Lock className="w-4 h-4 mr-2" />
                {isLoading ? 'Changing...' : 'Change Password'}
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium text-foreground mb-2">Password Requirements</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li className={passwordData.newPassword.length >= 8 ? 'text-success' : ''}>
                    • At least 8 characters
                  </li>
                  <li className={/[A-Z]/.test(passwordData.newPassword) ? 'text-success' : ''}>
                    • One uppercase letter
                  </li>
                  <li className={/[a-z]/.test(passwordData.newPassword) ? 'text-success' : ''}>
                    • One lowercase letter
                  </li>
                  <li className={/\d/.test(passwordData.newPassword) ? 'text-success' : ''}>
                    • One number
                  </li>
                  <li className={/[^A-Za-z0-9]/.test(passwordData.newPassword) ? 'text-success' : ''}>
                    • One special character
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium text-foreground mb-2">Security Tips</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Use a unique password</li>
                  <li>• Don't share your password</li>
                  <li>• Update regularly</li>
                  <li>• Use a password manager</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Account Management & Data */}
      <div className="grid gap-6 xl:grid-cols-2">
        {/* Account Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="premium-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                <Crown className="w-4 h-4 text-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Account Information</h3>
                <p className="text-muted-foreground text-sm">Your account details and role information</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-1">
                <div className="space-y-2">
                  <label className="form-label">User ID</label>
                  <p className="text-sm font-mono bg-muted px-3 py-2 rounded-lg text-foreground">{user?.id}</p>
                </div>
                <div className="space-y-2">
                  <label className="form-label">Role</label>
                  <Badge variant="secondary" className="w-fit">
                    {user?.role}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <label className="form-label">Member Since</label>
                  <p className="text-sm font-mono bg-muted px-3 py-2 rounded-lg text-foreground">
                    {(user as unknown as { createdAt?: string })?.createdAt ? new Date((user as unknown as { createdAt?: string }).createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="form-label">Last Login</label>
                  <p className="text-sm bg-muted px-3 py-2 rounded-lg text-foreground">
                    {(user as unknown as { lastLoginAt?: string })?.lastLoginAt ? new Date((user as unknown as { lastLoginAt?: string }).lastLoginAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Data Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <div className="premium-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                <Download className="w-4 h-4 text-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Data Management</h3>
                <p className="text-muted-foreground text-sm">Export or delete your account data</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium text-foreground mb-2">Export Your Data</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Download a copy of all your data including profile information, tasks, and activity history.
                </p>
                <button 
                  onClick={handleExportData} 
                  disabled={isLoading} 
                  className="btn-gradient"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isLoading ? 'Exporting...' : 'Export Data'}
                </button>
              </div>

              <Separator />

              <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                <h4 className="font-medium text-destructive mb-2">Danger Zone</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <button 
                  onClick={handleDeleteAccount} 
                  disabled={isLoading} 
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isLoading ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 