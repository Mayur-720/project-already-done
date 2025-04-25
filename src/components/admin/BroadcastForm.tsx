
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/context/AuthContext';
import { sendBroadcastNotification, scheduleBroadcastNotification, getAllUsers } from '@/lib/api-admin';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

const formSchema = z.object({
  title: z.string().min(2, { message: 'Title must be at least 2 characters' }),
  body: z.string().min(10, { message: 'Message must be at least 10 characters' }),
  delivery: z.enum(['immediate', 'scheduled']),
  scheduledFor: z.date().optional(),
  targetGroup: z.enum(['all', 'specific']),
  targetUsers: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const BroadcastForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const [date, setDate] = useState<Date | undefined>(undefined);
  
  const { data: users } = useQuery({
    queryKey: ['admin-users'],
    queryFn: getAllUsers,
    enabled: !!user && user.role === 'admin'
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      body: '',
      delivery: 'immediate',
      targetGroup: 'all',
      targetUsers: [],
    },
  });
  
  const targetGroup = form.watch('targetGroup');
  const delivery = form.watch('delivery');
  
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const notificationData = {
        title: data.title,
        body: data.body,
        targetGroup: data.targetGroup,
        targetUsers: data.targetUsers,
      };
      
      if (data.delivery === 'immediate') {
        await sendBroadcastNotification(notificationData);
        toast({
          title: 'Notification sent',
          description: 'Your message has been broadcast to users.',
        });
      } else {
        if (!data.scheduledFor) {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Please select a scheduled date and time.',
          });
          setIsSubmitting(false);
          return;
        }
        
        await scheduleBroadcastNotification({
          ...notificationData,
          scheduledFor: data.scheduledFor.toISOString(),
        });
        
        toast({
          title: 'Notification scheduled',
          description: `Your message will be sent on ${format(data.scheduledFor, 'PPP p')}`,
        });
      }
      
      form.reset();
      setDate(undefined);
    } catch (error) {
      console.error('Failed to send notification:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send notification. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notification Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter notification title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message Content</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter your message content" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="delivery"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Delivery</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="immediate" />
                    </FormControl>
                    <FormLabel className="font-normal">Send immediately</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="scheduled" />
                    </FormControl>
                    <FormLabel className="font-normal">Schedule for later</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {delivery === 'scheduled' && (
          <FormField
            control={form.control}
            name="scheduledFor"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Schedule Date/Time</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${
                          !field.value && "text-muted-foreground"
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value, "PPP p")
                        ) : (
                          <span>Pick a date and time</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(date) => {
                        setDate(date);
                        if (date) {
                          // Set to current time
                          const now = new Date();
                          date.setHours(now.getHours(), now.getMinutes());
                          field.onChange(date);
                        }
                      }}
                    />
                    {date && (
                      <div className="p-3 border-t">
                        <Input
                          type="time"
                          onChange={(e) => {
                            const [hours, minutes] = e.target.value.split(':');
                            const newDate = new Date(date);
                            newDate.setHours(parseInt(hours), parseInt(minutes));
                            field.onChange(newDate);
                          }}
                          className="w-full"
                        />
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="targetGroup"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Audience</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target audience" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="specific">Specific Users</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {targetGroup === 'specific' && users && users.length > 0 && (
          <FormField
            control={form.control}
            name="targetUsers"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Users</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(value) => {
                      const currentValues = new Set(field.value);
                      if (currentValues.has(value)) {
                        currentValues.delete(value);
                      } else {
                        currentValues.add(value);
                      }
                      field.onChange(Array.from(currentValues));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`${field.value?.length || 0} users selected`} />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user: any) => (
                        <SelectItem key={user._id} value={user._id}>
                          {user.username} ({user.anonymousAlias})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isSubmitting}>
          {isSubmitting ? 'Processing...' : 'Send Notification'}
        </Button>
      </form>
    </Form>
  );
};

export default BroadcastForm;
