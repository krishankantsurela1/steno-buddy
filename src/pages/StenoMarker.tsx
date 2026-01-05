import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileCheck, Keyboard, Play, ArrowLeft } from 'lucide-react';
import StenoMarkerTool from '@/components/StenoMarkerTool';
import TypingPractice from '@/components/TypingPractice';

const CORRECT_PASSWORD = '68194934';

const StenoMarker = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('steno-marker');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === CORRECT_PASSWORD) {
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-elevated">
          <CardHeader className="text-center space-y-3">
            <div className="mx-auto p-4 bg-primary/10 rounded-full w-fit">
              <Play className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Steno Tools
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              Enter password to access
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="off"
                />
              </div>
              
              {loginError && (
                <p className="text-sm text-destructive font-medium">{loginError}</p>
              )}
              
              <Button type="submit" className="w-full">
                Access Tools
              </Button>
              
              <div className="text-center">
                <Link to="/" className="text-sm text-primary hover:text-primary/80">
                  ← Back to Main
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with Navigation */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-primary hover:text-primary/80">
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back</span>
            </Link>
            <h1 className="text-xl font-bold text-foreground">Steno Tools</h1>
            <div className="w-16"></div>
          </div>
        </div>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="container mx-auto px-4">
            <TabsList className="w-full max-w-md mx-auto grid grid-cols-2 h-12">
              <TabsTrigger value="steno-marker" className="flex items-center gap-2 text-sm">
                <FileCheck className="w-4 h-4" />
                Steno Marker
              </TabsTrigger>
              <TabsTrigger value="typing-practice" className="flex items-center gap-2 text-sm">
                <Keyboard className="w-4 h-4" />
                Typing Practice
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>
      </header>

      {/* Tab Content */}
      <main className="flex-1">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="steno-marker" className="mt-0">
            <StenoMarkerTool />
          </TabsContent>
          <TabsContent value="typing-practice" className="mt-0">
            <TypingPractice />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-sm text-muted-foreground border-t border-border no-print">
        <p>Steno Tools • Marker & Typing Practice</p>
      </footer>
    </div>
  );
};

export default StenoMarker;
