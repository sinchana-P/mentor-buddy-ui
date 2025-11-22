import { useState } from "react";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/contexts/ThemeContext";
import {
  useChangePasswordMutation,
  useLazyExportUserDataQuery,
  useUpdateProfileMutation,
} from "@/api/apiSlice";
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Palette,
  Eye,
  EyeOff,
  Download,
  Lock,
  Database,
  Camera,
  Upload,
  X,
  Users,
  Sparkles,
} from "lucide-react";
import { createAvatar } from '@dicebear/core';
import { avataaars, bottts, lorelei, pixelArt, initials } from '@dicebear/collection';

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  // API mutations
  const [changePassword, { isLoading: isChangingPassword }] =
    useChangePasswordMutation();
  // const [deleteAccount, { isLoading: isDeletingAccount }] =
  //   useDeleteAccountMutation();
  const [updateProfile] = useUpdateProfileMutation();

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    domainRole: user?.domainRole || "",
    timezone: "UTC (GMT+0)",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user?.avatarUrl || null
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [selectedAvatarStyle, setSelectedAvatarStyle] = useState<'avataaars' | 'bottts' | 'lorelei' | 'pixelArt' | 'initials'>('avataaars');

  // Generate predefined avatars
  const generateAvatarOptions = (style: typeof selectedAvatarStyle) => {
    const seeds = [
      user?.name || 'User',
      user?.email || 'user@example.com',
      'happy',
      'cool',
      'professional',
      'friendly',
      'smart',
      'creative',
      'energetic',
      'calm',
      'focused',
      'innovative'
    ];

    const styleMap = {
      avataaars,
      bottts,
      lorelei,
      pixelArt,
      initials
    };

    return seeds.map((seed, index) => {
      const avatar = createAvatar(styleMap[style], {
        seed,
        size: 128,
      });
      return {
        id: `${style}-${index}`,
        dataUri: avatar.toDataUri(),
        seed,
      };
    });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type - support all common image formats
    const validTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
      "image/bmp",
      "image/tiff",
      "image/x-icon",
      "image/avif"
    ];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a valid image file (JPG, PNG, GIF, WebP, SVG, BMP, TIFF, ICO, AVIF).",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Avatar image must be less than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setAvatarFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) {
      toast({
        title: "No Image Selected",
        description: "Please select an image to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingAvatar(true);

    try {
      // Convert to base64 for storage
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;

        try {
          await updateProfile({ avatarUrl: base64String }).unwrap();

          toast({
            title: "Avatar Updated",
            description: "Your profile picture has been updated successfully.",
          });

          setAvatarFile(null);
        } catch (error: unknown) {
          toast({
            title: "Upload Failed",
            description:
              (error as { data?: { message?: string } })?.data?.message ||
              "Failed to update avatar. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsUploadingAvatar(false);
        }
      };
      reader.readAsDataURL(avatarFile);
    } catch {
      toast({
        title: "Upload Failed",
        description: "Failed to process image. Please try again.",
        variant: "destructive",
      });
      setIsUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      await updateProfile({ avatarUrl: "" }).unwrap();
      setAvatarPreview(null);
      setAvatarFile(null);

      toast({
        title: "Avatar Removed",
        description: "Your profile picture has been removed.",
      });
    } catch (error: unknown) {
      toast({
        title: "Error",
        description:
          (error as { data?: { message?: string } })?.data?.message ||
          "Failed to remove avatar. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSelectPredefinedAvatar = async (avatarDataUri: string) => {
    try {
      setIsUploadingAvatar(true);
      await updateProfile({ avatarUrl: avatarDataUri }).unwrap();
      setAvatarPreview(avatarDataUri);
      setAvatarFile(null);
      setShowAvatarSelector(false);

      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been updated successfully.",
      });
    } catch (error: unknown) {
      toast({
        title: "Error",
        description:
          (error as { data?: { message?: string } })?.data?.message ||
          "Failed to update avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handlePasswordChange = async () => {
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all password fields.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "New password and confirmation don't match.",
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

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      toast({
        title: "Password Changed",
        description: "Your password has been changed successfully.",
      });
    } catch (error: unknown) {
      toast({
        title: "Error",
        description:
          (error as { data?: { message?: string } })?.data?.message ||
          "Failed to change password. Please check your current password and try again.",
        variant: "destructive",
      });
    }
  };

  const [triggerExport, { isLoading: isExporting }] = useLazyExportUserDataQuery();

  const handleExportData = async () => {
    try {
      const { data } = await triggerExport();

      if (data) {
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `mentor-buddy-data-${
          new Date().toISOString().split("T")[0]
        }.json`;
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
        description:
          (error as { data?: { message?: string } })?.data?.message ||
          "Failed to export data. Please try again.",
        variant: "destructive",
      });
    }
  };

  // const handleDeleteAccount = async () => {
  //   const confirmed = window.confirm(
  //     "Are you sure you want to delete your account? This action cannot be undone."
  //   );
  //   if (!confirmed) return;

  //   try {
  //     await deleteAccount().unwrap();
  //     toast({
  //       title: "Account Deleted",
  //       description: "Your account has been scheduled for deletion.",
  //     });
  //   } catch (error: unknown) {
  //     toast({
  //       title: "Error",
  //       description:
  //         (error as { data?: { message?: string } })?.data?.message ||
  //         "Failed to delete account. Please try again.",
  //       variant: "destructive",
  //     });
  //   }
  // };

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden">
      <div className="content-responsive py-4 sm:py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="premium-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-card rounded-xl flex items-center justify-center ring-1 ring-border">
              <SettingsIcon className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Settings</h1>
              <p className="text-muted-foreground">
                Manage your account settings and preferences
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="premium-card"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Profile Settings
                </h2>
                <p className="text-sm text-muted-foreground">
                  Update your personal information and profile
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Avatar Upload */}
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  {/* Avatar Preview */}
                  <div className="relative group">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar"
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">
                          {user?.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") || "U"}
                        </span>
                      </div>
                    )}
                    {/* Camera overlay on hover */}
                    <label
                      htmlFor="avatar-upload"
                      className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Camera className="w-6 h-6 text-white" />
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground mb-1">
                      Profile Picture
                    </p>
                    <p className="text-xs text-muted-foreground mb-2">
                      {/* JPG, PNG, GIF, WebP, SVG, BMP, TIFF, ICO, AVIF  */}
                      (Max 5MB)
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <label
                        htmlFor="avatar-upload-btn"
                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Upload
                        <input
                          id="avatar-upload-btn"
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                      </label>

                      <Dialog open={showAvatarSelector} onOpenChange={setShowAvatarSelector}>
                        <DialogTrigger asChild>
                          <button
                            className="px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-medium transition-colors inline-flex items-center gap-1.5"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            Choose Avatar
                          </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-[#0a0a0f] border-white/10">
                          <DialogHeader>
                            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                              <Users className="w-5 h-5 text-blue-400" />
                              Choose Your Avatar
                            </DialogTitle>
                          </DialogHeader>

                          <div className="space-y-4">
                            {/* Avatar Style Selector */}
                            <div>
                              <label className="block text-sm font-medium text-white mb-2">
                                Avatar Style
                              </label>
                              <Select value={selectedAvatarStyle} onValueChange={(value) => setSelectedAvatarStyle(value as typeof selectedAvatarStyle)}>
                                <SelectTrigger className="w-full bg-white/5 border-white/10">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="avataaars">Avataaars (Cartoon)</SelectItem>
                                  <SelectItem value="bottts">Bottts (Robots)</SelectItem>
                                  <SelectItem value="lorelei">Lorelei (Illustrations)</SelectItem>
                                  <SelectItem value="pixelArt">Pixel Art</SelectItem>
                                  <SelectItem value="initials">Initials</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Avatar Grid */}
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                              {generateAvatarOptions(selectedAvatarStyle).map((avatar) => (
                                <button
                                  key={avatar.id}
                                  onClick={() => handleSelectPredefinedAvatar(avatar.dataUri)}
                                  disabled={isUploadingAvatar}
                                  className="relative aspect-square rounded-lg overflow-hidden bg-white/5 hover:bg-white/10 border-2 border-transparent hover:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                                >
                                  <img
                                    src={avatar.dataUri}
                                    alt={`Avatar ${avatar.seed}`}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                      </div>
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      {avatarPreview && (
                        <button
                          onClick={handleRemoveAvatar}
                          className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium transition-colors inline-flex items-center gap-1.5"
                        >
                          <X className="w-3.5 h-3.5" />
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Upload button - shown when file is selected */}
                {avatarFile && (
                  <button
                    onClick={handleAvatarUpload}
                    disabled={isUploadingAvatar}
                    className="w-full px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Upload className="w-4 h-4" />
                    {isUploadingAvatar ? "Uploading..." : "Upload Avatar"}
                  </button>
                )}
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, name: e.target.value })
                  }
                  className="input-premium w-full"
                  placeholder="Enter your full name"
                  disabled
                />
              </div>

              {/* Email (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  disabled
                  className="input-premium w-full opacity-60 cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Email cannot be changed
                </p>
              </div>

              {/* Domain Role (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Domain Role
                </label>
                <Select value={profileData.domainRole} disabled>
                  <SelectTrigger className="input-premium opacity-60 cursor-not-allowed">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="frontend">Frontend</SelectItem>
                    <SelectItem value="backend">Backend</SelectItem>
                    <SelectItem value="fullstack">Fullstack</SelectItem>
                    <SelectItem value="devops">DevOps</SelectItem>
                    <SelectItem value="qa">QA</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Timezone */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Timezone
                </label>
                <Select
                  value={"IST (GMT+5:30)"}
                  onValueChange={(value) =>
                    setProfileData({ ...profileData, timezone: value })
                  }
                  disabled
                >
                  <SelectTrigger className="input-premium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC (GMT+0)">UTC (GMT+0)</SelectItem>
                    <SelectItem value="EST (GMT-5)">EST (GMT-5)</SelectItem>
                    <SelectItem value="PST (GMT-8)">PST (GMT-8)</SelectItem>
                    <SelectItem value="IST (GMT+5:30)">
                      IST (GMT+5:30)
                    </SelectItem>
                    <SelectItem value="CET (GMT+1)">CET (GMT+1)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* <button className="btn-gradient w-full">
              Update Profile
            </button> */}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="premium-card"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-card rounded-lg flex items-center justify-center ring-1 ring-border">
                <Palette className="w-4 h-4 text-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Theme & Appearance
                </h2>
                <p className="text-sm text-muted-foreground">
                  Customize your visual experience
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-foreground mb-2">
                Choose Theme
              </label>

              {/* Dark Mode */}
              <button
                onClick={() => setTheme("dark")}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  theme === "dark"
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <p className="font-medium text-foreground">Dark Mode</p>
                    <p className="text-xs text-muted-foreground">
                      High contrast dark theme with optimal readability
                    </p>
                  </div>
                  {theme === "dark" && (
                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </div>
              </button>

              {/* Navy Blue */}
              <button
                onClick={() => setTheme("navy")}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  theme === "navy"
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <p className="font-medium text-foreground">Navy Blue</p>
                    <p className="text-xs text-muted-foreground">
                      Professional navy theme with vibrant blue accents
                    </p>
                  </div>
                  {theme === "navy" && (
                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </div>
              </button>

              {/* Light Mode */}
              <button
                onClick={() => setTheme("light")}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  theme === "light"
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <p className="font-medium text-foreground">Light Mode</p>
                    <p className="text-xs text-muted-foreground">
                      Elegant white shade palette with warm undertones
                    </p>
                  </div>
                  {theme === "light" && (
                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                </div>
              </button>
            </div>
          </motion.div>
        </div>


        {/* Security Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="premium-card"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-card rounded-lg flex items-center justify-center ring-1 ring-border">
              <Shield className="w-4 h-4 text-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Security Settings
              </h2>
              <p className="text-sm text-muted-foreground">
                Manage your account security and password
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  className="input-premium w-full pr-10"
                  placeholder="Enter your current password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("current")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPasswords.current ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  className="input-premium w-full pr-10"
                  placeholder="Enter your new password (min 8 characters)"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("new")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPasswords.new ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="input-premium w-full pr-10"
                  placeholder="Confirm your new password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("confirm")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-white/5 rounded-lg p-4">
              <p className="text-sm font-medium text-foreground mb-2">
                Password Requirements:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• At least 8 characters</li>
                <li>• One uppercase letter</li>
                <li>• One lowercase letter</li>
                <li>• One number</li>
                <li>• One special character</li>
              </ul>
            </div>

            <button
              onClick={handlePasswordChange}
              disabled={isChangingPassword}
              className="btn-gradient w-full flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              {isChangingPassword ? "Changing Password..." : "Change Password"}
            </button>
          </div>
        </motion.div>
        {/* </div> */}

        {/* Account Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="premium-card"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <Database className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Data Management
              </h2>
              <p className="text-sm text-muted-foreground">
                Export or delete your account data
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Export Data */}
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Download className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground mb-1">
                    Export Your Data
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Download a copy of all your data including profile
                    information, tasks, and activity history.
                  </p>
                  <button
                    onClick={handleExportData}
                    disabled={isExporting}
                    className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download className="w-4 h-4" />
                    {isExporting ? 'Exporting...' : 'Export Data'}
                  </button>
                </div>
              </div>
            </div>

            {/* Delete Account - Danger Zone */}
            {/* <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5 text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-red-400 mb-1">Danger Zone</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Once you delete your account, there is no going back. Please
                    be certain.
                  </p>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isDeletingAccount}
                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    {isDeletingAccount
                      ? "Deleting Account..."
                      : "Delete Account"}
                  </button>
                </div>
              </div>
            </div> */}
          </div>
        </motion.div>
      </motion.div>
      </div>
    </div>
  );
}
