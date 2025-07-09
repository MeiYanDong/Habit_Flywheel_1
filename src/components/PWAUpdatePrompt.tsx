import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, X, Wifi, WifiOff } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

export const PWAUpdatePrompt: React.FC = () => {
  const { status, updateServiceWorker, closePrompt } = usePWA();

  const handleUpdate = async () => {
    await updateServiceWorker(true);
  };

  // 离线状态提示
  if (status.isOffline) {
    return (
      <Card className="fixed top-4 left-4 right-4 z-50 border-yellow-500/20 bg-yellow-50/95 backdrop-blur-sm dark:bg-yellow-950/95 md:left-auto md:right-4 md:w-96">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
            <WifiOff className="h-4 w-4" />
            离线模式
          </CardTitle>
          <CardDescription className="text-yellow-600 dark:text-yellow-400">
            您当前处于离线状态，应用将使用缓存数据
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // 应用已就绪（离线可用）
  if (status.offlineReady && !status.needRefresh) {
    return (
      <Card className="fixed top-4 left-4 right-4 z-50 border-green-500/20 bg-green-50/95 backdrop-blur-sm dark:bg-green-950/95 md:left-auto md:right-4 md:w-96">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2 text-green-700 dark:text-green-300">
                <Wifi className="h-4 w-4" />
                应用已就绪
              </CardTitle>
              <CardDescription className="text-green-600 dark:text-green-400">
                应用已准备好离线使用
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={closePrompt}
              className="h-6 w-6 p-0 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>
    );
  }

  // 有新版本可用
  if (status.needRefresh) {
    return (
      <Card className="fixed top-4 left-4 right-4 z-50 border-blue-500/20 bg-blue-50/95 backdrop-blur-sm dark:bg-blue-950/95 md:left-auto md:right-4 md:w-96">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <RefreshCw className="h-4 w-4" />
                新版本可用
              </CardTitle>
              <CardDescription className="text-blue-600 dark:text-blue-400">
                发现新版本，点击更新获得最新功能
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={closePrompt}
              className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex gap-2">
            <Button 
              onClick={handleUpdate}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              立即更新
            </Button>
            <Button 
              variant="outline" 
              onClick={closePrompt}
              size="sm"
              className="border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-950"
            >
              稍后更新
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}; 