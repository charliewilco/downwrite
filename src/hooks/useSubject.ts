import { useEffect, useReducer } from "react";
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
