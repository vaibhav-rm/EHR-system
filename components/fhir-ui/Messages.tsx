'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, Send } from 'lucide-react';
import { useState } from 'react';

const MOCK_MESSAGES = [
    { id: 1, sender: 'Dr. Sarah Connor', subject: 'Lab Results Follow-up', date: '2 days ago', preview: 'Your recent blood work looks good, but I want to discuss...' },
    { id: 2, sender: 'System Notification', subject: 'Appointment Confirmed', date: '5 days ago', preview: 'Your appointment with Dr. Doe is confirmed for...' },
];

export function Messages() {
  const [selectedMessage, setSelectedMessage] = useState<number | null>(null);

  return (
    <div className="grid gap-6 md:grid-cols-3 h-[600px]">
       <Card className="md:col-span-1 flex flex-col">
            <CardHeader className="p-4 border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Mail className="h-5 w-5" /> Inbox
                </CardTitle>
                <div className="relative">
                    <Input placeholder="Search messages..." className="h-8 text-xs" />
                </div>
            </CardHeader>
            <div className="flex-1 overflow-y-auto scrollbar-thin">
                <div className="flex flex-col gap-1 p-2">
                    {MOCK_MESSAGES.map((msg) => (
                        <button
                            key={msg.id}
                            className={`flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent ${selectedMessage === msg.id ? 'bg-accent' : ''}`}
                            onClick={() => setSelectedMessage(msg.id)}
                        >
                            <div className="flex w-full flex-col gap-1">
                                <div className="flex items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="font-semibold">{msg.sender}</div>
                                    </div>
                                    <div className="ml-auto text-xs text-muted-foreground">{msg.date}</div>
                                </div>
                                <div className="text-xs font-medium">{msg.subject}</div>
                            </div>
                            <div className="line-clamp-2 text-xs text-muted-foreground">
                                {msg.preview}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
       </Card>

       <Card className="md:col-span-2 flex flex-col">
           {selectedMessage ? (
               <>
                <CardHeader className="p-4 border-b">
                    <div className="flex items-center gap-4">
                        <Avatar>
                            <AvatarImage src="/avatars/01.png" alt="@shadcn" />
                            <AvatarFallback>SC</AvatarFallback>
                        </Avatar>
                        <div className="grid gap-1">
                            <div className="font-semibold">Dr. Sarah Connor</div>
                            <div className="text-xs text-muted-foreground">Subject: Lab Results Follow-up</div>
                        </div>
                    </div>
                </CardHeader>
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="text-sm">
                        <p>Hi there,</p>
                        <br />
                        <p>Your recent blood work looks good, but I want to discuss the cholesterol levels. They are slightly elevated.</p>
                        <p>Please schedule a follow-up appointment when you can.</p>
                        <br />
                        <p>Best,</p>
                        <p>Dr. Connor</p>
                    </div>
                </div>
                <div className="p-4 border-t mt-auto">
                    <form className="flex w-full items-center space-x-2">
                        <Input type="text" placeholder="Reply..." />
                        <Button type="submit" size="icon">
                            <Send className="h-4 w-4" />
                            <span className="sr-only">Send</span>
                        </Button>
                    </form>
                </div>
               </>
           ) : (
               <div className="flex flex-col items-center justify-center h-full text-muted-foreground/50">
                    <Mail className="h-10 w-10 mb-2" />
                    <p>Select a message to read</p>
               </div>
           )}
       </Card>
    </div>
  );
}
