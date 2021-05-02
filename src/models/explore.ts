export interface Topic {
  title: string;
  id: number;
  abbreviated_title: string;
}

export interface MainTopic extends Topic {
  topics: Topic[];
}
