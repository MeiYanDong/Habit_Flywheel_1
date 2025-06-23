
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Loader2, Mail, Lock, CheckCircle } from 'lucide-react';

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isProcessingAuth, setIsProcessingAuth] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // 处理邮箱确认回调
    const handleAuthCallback = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const type = hashParams.get('type');
      
      if (accessToken && refreshToken && type === 'signup') {
        setIsProcessingAuth(true);
        try {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (error) throw error;
          
          toast({
            title: "邮箱验证成功",
            description: "您的账户已成功激活，欢迎使用习惯飞轮！",
          });
          
          // 清除URL中的认证参数
          window.history.replaceState({}, document.title, '/');
          
          // 导航到主页
          navigate('/');
        } catch (error) {
          console.error('Authentication callback error:', error);
          toast({
            title: "验证失败",
            description: "邮箱验证失败，请重试登录",
            variant: "destructive",
          });
        } finally {
          setIsProcessingAuth(false);
        }
      }
    };

    // 检查用户是否已经登录
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && !window.location.hash) {
        navigate('/');
      }
    };

    handleAuthCallback();
    checkUser();
  }, [navigate, toast]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        title: "密码不匹配",
        description: "请确保两次输入的密码相同",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });

    if (error) {
      toast({
        title: "注册失败",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "注册成功",
        description: "请检查您的邮箱并点击确认链接完成注册",
      });
    }
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "登录失败",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "登录成功",
        description: "欢迎回到习惯飞轮！",
      });
      navigate('/');
    }
    setLoading(false);
  };

  // 如果正在处理认证回调，显示处理中状态
  if (isProcessingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-amber-50 dark:from-purple-900/20 dark:to-amber-900/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">验证中...</h2>
            <p className="text-gray-600 text-center mb-4">正在验证您的邮箱，请稍候</p>
            <Loader2 className="h-6 w-6 animate-spin" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-amber-50 dark:from-purple-900/20 dark:to-amber-900/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="text-4xl mb-4">🌟</div>
          <CardTitle className="text-2xl">习惯飞轮</CardTitle>
          <p className="text-gray-600 dark:text-gray-400">让每一份努力都精准浇灌你的目标</p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">登录</TabsTrigger>
              <TabsTrigger value="signup">注册</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">邮箱</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">密码</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="输入密码"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  登录
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">邮箱</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">密码</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="创建密码（至少6位）"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      minLength={6}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">确认密码</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="再次输入密码"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  注册
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
