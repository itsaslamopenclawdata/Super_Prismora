'use client';

import { Button } from '@super-prismora/ui';
import { Card, CardHeader, CardTitle, CardContent } from '@super-prismora/ui';
import { Badge } from '@super-prismora/ui';
import type { SubscriptionPlan } from '@/types/auth';

interface SubscriptionPlanCardProps {
  plan: SubscriptionPlan;
  currentPlan?: string;
  onSelect: (priceId: string) => void;
  isYearly?: boolean;
}

/**
 * Subscription Plan Card Component
 *
 * Displays pricing plan with features and selection button.
 */
export function SubscriptionPlanCard({
  plan,
  currentPlan,
  onSelect,
  isYearly = false,
}: SubscriptionPlanCardProps) {
  const isCurrentPlan = currentPlan === plan.name.toLowerCase();
  const isSelected = isYearly ? plan.interval === 'year' : plan.interval === 'month';

  return (
    <Card
      variant={plan.popular ? 'elevated' : 'default'}
      padding="lg"
      className={`relative ${plan.popular ? 'border-2 border-blue-500' : ''}`}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge variant="primary" size="lg">
            Most Popular
          </Badge>
        </div>
      )}

      <CardHeader>
        <CardTitle className="text-center">{plan.name}</CardTitle>
        <div className="text-center mt-4">
          <span className="text-4xl font-bold">${plan.price}</span>
          <span className="text-gray-600 dark:text-gray-400">/{plan.interval}</span>
        </div>
      </CardHeader>

      <CardContent>
        <ul className="space-y-3 mb-6">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <svg
                className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-sm text-gray-600 dark:text-gray-400">{feature}</span>
            </li>
          ))}
        </ul>

        <Button
          variant={plan.popular ? 'primary' : isCurrentPlan ? 'secondary' : 'outline'}
          className="w-full"
          onClick={() => onSelect(plan.priceId)}
          disabled={isCurrentPlan}
        >
          {isCurrentPlan ? 'Current Plan' : plan.popular ? 'Upgrade to Pro' : 'Select Plan'}
        </Button>
      </CardContent>
    </Card>
  );
}
