import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { AvatarUploader } from '@/components/ui/avatar-uploader';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPassword('');
      setAvatar(user.avatar || '');
    }
  }, [user]);
  
  const handleSubmit = () => {
    if (!user) return;
    
    const updatedUser = {
      ...user,
      name,
      email,
      avatar,
      password: password || user.password
    };
    
    updateUser(updatedUser);
  };
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card className="overflow-hidden shadow-xl">
        <CardHeader className="flex flex-col items-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white py-10">
          <AvatarUploader
            value={avatar}
            onChange={setAvatar}
            className="h-32 w-32 rounded-full ring-4 ring-white shadow-lg"
          />
          <h2 className="mt-4 text-3xl font-semibold tracking-wide">{name || 'Your Name'}</h2>
          {user?.role && (
            <Badge variant="secondary" className="mt-2 capitalize">
              {user.role.replace('_', ' ')}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="p-8">
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="info">Personal Info</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="prefs">Preferences</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="name">
                  Full Name
                </label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="email">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="prefs" className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Enable email notifications</span>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Dark mode</span>
                <Switch />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end mt-6">
            <Button onClick={handleSubmit}>Save Changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
