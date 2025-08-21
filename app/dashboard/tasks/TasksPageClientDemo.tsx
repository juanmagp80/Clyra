'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
    CheckCircle2, 
    Circle, 
    Plus, 
    Clock, 
    Flag, 
    Calendar,
    Target,
    TrendingUp,
    Filter,
    Search,
    Star,
    Users,
    Tag,
    AlertCircle,
    Play,
    Pause,
    MoreHorizontal,
    Archive,
    Trash2,
    Edit3,
    Brain,
    Lightbulb,
    BarChart3,
    Timer
} from 'lucide-react';
import { format, addDays, isToday, isPast } from 'date-fns';
import { es } from 'date-fns/locale';

// Datos demo importados
import { demoTasks, demoClients, demoProjects } from '@/app/demo/demo-data';

// ==================== TIPOS ====================
interface Task {