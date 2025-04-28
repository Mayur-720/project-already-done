
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface RecognitionStatsProps {
  recognitionAttempts?: number;
  successfulRecognitions?: number;
  recognitionRate?: number;
  recognizedUsers?: number;
  identityRecognizers?: number;
}

const RecognitionStats: React.FC<RecognitionStatsProps> = ({
  recognitionAttempts = 0,
  successfulRecognitions = 0,
  recognitionRate = 0,
  recognizedUsers = 0,
  identityRecognizers = 0,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <StatCard
        label="Attempts"
        value={recognitionAttempts}
        description="Recognition attempts"
      />
      <StatCard
        label="Success"
        value={successfulRecognitions}
        description="Successful recognitions"
      />
      <StatCard
        label="Rate"
        value={`${recognitionRate.toFixed(0)}%`}
        description="Recognition success rate"
      />
      <StatCard
        label="Recognized"
        value={recognizedUsers}
        description="Users you've recognized"
      />
      <StatCard
        label="Recognizers"
        value={identityRecognizers}
        description="Users who recognized you"
      />
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: number | string;
  description: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, description }) => {
  return (
    <Card className="bg-gradient-to-br from-gray-900/50 to-gray-900/30 border-purple-500/30 backdrop-blur-sm">
      <CardContent className="p-4 text-center">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-purple-400">{value}</p>
        <p className="text-xs text-gray-400 mt-1">{description}</p>
      </CardContent>
    </Card>
  );
};

export default RecognitionStats;
