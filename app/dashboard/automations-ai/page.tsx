import { Metadata } from 'next';
import AutomationsAIClient from './AutomationsAIClient';

export const metadata: Metadata = {
  title: 'Automatizaciones IA | Taskelio',
  description: 'Automatiza tu trabajo freelance con inteligencia artificial integrada',
};

export default function AutomationsAIPage() {
  return <AutomationsAIClient />;
}
