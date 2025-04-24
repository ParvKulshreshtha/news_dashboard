// store/slices/newsSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

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
  type: 'all' | 'news' | 'blog';
  startDate: string;
  endDate: string;
}

interface NewsState {
  newsData: Article[];
  loading: boolean;
  error: string | null;
  filters: Filters;
  sort: {
    field: 'publishedAt' | 'title' | 'author';
    direction: 'asc' | 'desc';
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
    field: 'publishedAt',
    direction: 'desc', // newest first
  }  
};

export const fetchNews = createAsyncThunk('news/fetchNews', async () => {
  const response = await fetch(
    'https://newsapi.org/v2/everything?q=pakistan&apiKey=501eecc06f9843519f8208419df9a6b0'
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
    setTypeFilter(state, action: PayloadAction<'all' | 'news' | 'blog'>) {
      state.filters.type = action.payload;
    },
    setStartDateFilter(state, action: PayloadAction<string>) {
      state.filters.startDate = action.payload;
    },
    setEndDateFilter(state, action: PayloadAction<string>) {
      state.filters.endDate = action.payload;
    },
    setSortField(state, action: PayloadAction<'publishedAt' | 'title' | 'author'>) {
        state.sort.field = action.payload;
      },
    setSortDirection(state, action: PayloadAction<'asc' | 'desc'>) {
    state.sort.direction = action.payload;
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



export const {
  setAuthorFilter,
  setTypeFilter,
  setStartDateFilter,
  setEndDateFilter,
    setSortField,
  setSortDirection
} = newsSlice.actions;

export default newsSlice.reducer;
