'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Search, Send, Upload } from 'lucide-react'

export default function ThemedChatbotWithUploads() {
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', content: string }[]>([])
  const [input, setInput] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [sessionId, setSessionId] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSessionId(Math.random().toString(36).substring(7));
  }, []);

  const handleSend = async () => {
    if (input.trim() || files.length > 0) {
      const newMessage = { role: 'user' as const, content: input }
      setMessages(prev => [...prev, newMessage])
      setInput('')
      
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [...messages, newMessage],
            sessionId,
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to get response from Gemini');
        }
        
        const data = await response.json();
        const botMessage = { role: 'bot' as const, content: data.response }
        setMessages(prev => [...prev, botMessage])
      } catch (error) {
        console.error('Error:', error);
        const errorMessage = { role: 'bot' as const, content: 'Sorry, I encountered an error. Please try again.' }
        setMessages(prev => [...prev, errorMessage])
      }
      
      setFiles([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  return (
    <div className="relative w-full h-screen bg-gray-300 overflow-hidden">
      <Image
        src="/background.png"
        alt="Desert landscape with UI billboard"
        layout="fill"
        objectFit="cover"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-gray-800 bg-opacity-80 rounded-3xl w-[900px] h-[600px] p-8 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <div className="flex space-x-6 text-gray-400 text-sm">
              <span className="text-white">1. Data Pipeline</span>
              <span>2. Collect Data</span>
              <span>3. Train Model</span>
            </div>
          </div>
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-6 h-2 bg-white rounded-full" />
              <span className="text-white text-lg font-light">Avalina X</span>
            </div>
            <h1 className="text-white text-4xl font-light">Welcome! How would you like to get started?</h1>
          </div>
          <div className="flex-grow mb-6 overflow-y-auto">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
                <div className={`flex items-start max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`mx-2 p-3 rounded-lg ${message.role === 'user' ? 'bg-gray-700 bg-opacity-50' : 'bg-gray-600 bg-opacity-50'}`}>
                    <p className="text-white text-sm">{message.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-auto flex items-center bg-gray-700 bg-opacity-50 rounded-full px-4 py-2">
            <Search className="text-gray-400 w-5 h-5 mr-2" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className="bg-transparent text-white placeholder-gray-400 flex-grow outline-none"
            />
            <button onClick={() => fileInputRef.current?.click()} className="text-gray-400 hover:text-white transition-colors">
              <Upload className="w-5 h-5 ml-2" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            <button onClick={handleSend} className="text-gray-400 hover:text-white transition-colors">
              <Send className="w-5 h-5 ml-2" />
            </button>
          </div>
          {files.length > 0 && (
            <div className="text-sm text-gray-400 mt-2">
              {files.length} file(s) selected
            </div>
          )}
        </div>
      </div>
    </div>
  )
}