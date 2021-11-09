import { useEffect, useReducer, useMemo } from "react";
import { useSubscription } from "use-subscription";
import { BehaviorSubject } from "rxjs";

export function useSubjectEffect<T>(subject: BehaviorSubject<T>): T {
  const [value, dispatch] = useReducer(
    (_n: T, action: T) => action,
    subject.getValue()
  );

  useEffect(() => {
    const subscription = subject.subscribe((n) => dispatch(n));

    return () => {
      subscription.unsubscribe();
    };
  }, [subject]);

  return value;
}

export function useSubjectSubscription<T>(behaviorSubject: BehaviorSubject<T>) {
  const subscription = useMemo(
    () => ({
      getCurrentValue: () => behaviorSubject.getValue(),
      subscribe: (callback: any) => {
        const subscription = behaviorSubject.subscribe(callback);
        return () => subscription.unsubscribe();
      }
    }),

    // Re-subscribe any time the behaviorSubject changes
    [behaviorSubject]
  );

  return useSubscription(subscription);
}
