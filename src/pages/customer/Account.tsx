import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { User, Mail, Phone, MapPin, LogOut } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Account = () => {
  const { user, updateUser, logout } = useAuthStore();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      updateUser({
        name,
        email,
        phone,
        address,
      });

      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold mb-6">Your Account</h1>

      <div className="grid grid-cols-1 gap-6">
        <div>
          <Card title="Profile Information">
            {!isEditing ? (
              <div className="space-y-4">
                <div className="flex items-start">
                  <User className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div className="w-full flex flex-col md:flex-row md:justify-between">
                    <h3 className="text-sm font-medium text-gray-500">Name</h3>
                    <p className="md:max-w-[75%] md:text-right">{user?.name || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div className="w-full flex flex-col md:flex-row md:justify-between">
                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                    <p className="md:max-w-[75%] md:text-right">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div className="w-full flex flex-col md:flex-row md:justify-between">
                    <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                    <p className="md:max-w-[75%] md:text-right">{user?.phone || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div className="w-full flex flex-col md:flex-row md:justify-between">
                    <h3 className="text-sm font-medium text-gray-500">Address</h3>
                    <p className="md:max-w-[75%] md:text-right">{user?.address || 'Not provided'}</p>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    variant="primary"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <Input
                  label="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  icon={User}
                  required
                />

                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={Mail}
                  required
                />

                <Input
                  label="Phone (optional)"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  icon={Phone}
                />

                <Input
                  label="Address (optional)"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  icon={MapPin}
                />

                <div className="flex space-x-3 pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isLoading}
                  >
                    Save Changes
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setName(user?.name || '');
                      setEmail(user?.email || '');
                      setPhone(user?.phone || '');
                      setAddress(user?.address || '');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>

        <div>
          <Card title="Account Actions" noPadding={true}>
            <div className="">
              <div className="px-6 py-3 bg-gray-50 rounded-md flex items-center justify-between">
                <div>
                  <h5 className="font-medium mb-1">Password</h5>
                  <p className="text-sm text-gray-600">
                    Update your password to maintain account security.
                  </p>
                </div>
                <div>
                  <Button variant="ghost" fullWidth>
                    Change Password
                  </Button>
                </div>
              </div>

              <div className="px-6 py-3 bg-gray-50 flex items-center justify-between bg-primary/20">
                <div>
                  <h5 className="font-medium mb-1 text-red-600">Delete Account</h5>
                  <p className="text-sm text-red-600">
                    Permanently delete your account and all associated data.
                  </p>
                </div>
                <div>
                  <Button variant="ghost" fullWidth>
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Account;