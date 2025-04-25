// store/slices/newsSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

export interface Article {
  title: string;
  author: string | null;
  source: { name: string };
  publishedAt: string;
  url: string;
  content?: string;
  
}

interface Filters {
  author: string;
  type: string;
  startDate: string;
  endDate: string;
}

interface NewsState {
  newsData: Article[];
  loading: boolean;
  error: string | null;
  filters: Filters;
  sort: {
    field: string;
  };
}

const initialState: NewsState = {
  newsData: [],
  loading: false,
  error: null,
  filters: {
    author: '',
    type: 'all',
    startDate: '',
    endDate: '',
  },
  sort: {
    field: '',
  }  
};

export const fetchNews = createAsyncThunk('news/fetchNews', async () => {
  const response = await fetch(
    `https://newsapi.org/v2/everything?q=india&apiKey=${process.env.NEXT_PUBLIC_NEWS_API_KEY}`,
  );
  const data = await response.json();
  return data.articles as Article[];
});

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    setAuthorFilter(state, action: PayloadAction<string>) {
      state.filters.author = action.payload;
    },
    setTypeFilter(state, action: PayloadAction<string>) {
      state.filters.type = action.payload;
    },
    setStartDateFilter(state, action: PayloadAction<string>) {
      state.filters.startDate = action.payload;
    },
    setEndDateFilter(state, action: PayloadAction<string>) {
      state.filters.endDate = action.payload;
    },
    setSortField(state, action: PayloadAction<string>) {
        state.sort.field = action.payload;
      },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNews.fulfilled, (state, action) => {
        state.newsData = action.payload;
        state.loading = false;
      })
      .addCase(fetchNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch news';
      });
  },
});

export const selectAuthorStats = (state: RootState) => {
    const stats: Record<string, { articles: number }> = {};
  
    state.news.newsData.forEach((article: Article) => {
      const author = article.author?.trim() || 'Unknown';
      if (!stats[author]) stats[author] = { articles: 0 };
      stats[author].articles++;
    });
  
    return Object.entries(stats).map(([name, counts]) => ({
      name,
      ...counts,
    }));
  };


export const {
  setAuthorFilter,
  setTypeFilter,
  setStartDateFilter,
  setEndDateFilter,
    setSortField,
} = newsSlice.actions;

export default newsSlice.reducer;
