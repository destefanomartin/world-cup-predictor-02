// Hand-written database types matching db/migrations.
// Regenerate later with `supabase gen types typescript --project-id <id> > src/lib/database.types.ts`

export type AppRole = "admin" | "member";
export type MatchStage =
  | "group"
  | "round_of_32"
  | "round_of_16"
  | "quarter_final"
  | "semi_final"
  | "third_place"
  | "final";
export type MatchStatus = "scheduled" | "live" | "finished" | "postponed" | "cancelled";
export type BonusKind =
  | "top_scorer"
  | "mvp"
  | "best_goalkeeper"
  | "most_assists"
  | "champion"
  | "runner_up";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; display_name: string; avatar_url: string | null; created_at: string };
        Insert: { id: string; display_name: string; avatar_url?: string | null };
        Update: { display_name?: string; avatar_url?: string | null };
      };
      leagues: {
        Row: {
          id: string;
          name: string;
          invite_code: string;
          max_members: number;
          points_perfect: number;
          points_outcome: number;
          points_wrong: number;
          points_bonus: number;
          bonus_lock_at: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: {
          name: string;
          invite_code: string;
          max_members?: number;
          points_perfect?: number;
          points_outcome?: number;
          points_wrong?: number;
          points_bonus?: number;
          bonus_lock_at?: string | null;
          created_by: string;
        };
        Update: Partial<Database["public"]["Tables"]["leagues"]["Insert"]>;
      };
      league_members: {
        Row: { league_id: string; user_id: string; role: AppRole; joined_at: string };
        Insert: { league_id: string; user_id: string; role?: AppRole };
        Update: { role?: AppRole };
      };
      matches: {
        Row: {
          id: string;
          external_id: string | null;
          stage: MatchStage;
          group_label: string | null;
          matchday: number | null;
          kickoff_at: string;
          status: MatchStatus;
          home_team: string;
          away_team: string;
          home_flag: string | null;
          away_flag: string | null;
          home_score: number | null;
          away_score: number | null;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["matches"]["Row"], "id" | "updated_at"> & {
          id?: string;
        };
        Update: Partial<Database["public"]["Tables"]["matches"]["Insert"]>;
      };
      // CAMBIO: predictions ya no tienen league_id
      predictions: {
        Row: {
          id: string;
          user_id: string;
          match_id: string;
          home_score: number;
          away_score: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          match_id: string;
          home_score: number;
          away_score: number;
        };
        Update: { home_score?: number; away_score?: number };
      };
      bonus_bets: {
        Row: {
          id: string;
          league_id: string;
          user_id: string;
          kind: BonusKind;
          pick: string;
          points_awarded: number | null;
          created_at: string;
        };
        Insert: { league_id: string; user_id: string; kind: BonusKind; pick: string };
        Update: { pick?: string };
      };
      bonus_results: {
        Row: { kind: BonusKind; correct_pick: string; resolved_at: string };
        Insert: { kind: BonusKind; correct_pick: string };
        Update: { correct_pick?: string };
      };
      // NUEVAS TABLAS
      teams: {
        Row: {
          id: number;
          name: string;
          short_name: string | null;
          tla: string | null;
          crest: string | null;
          updated_at: string;
        };
        Insert: { id: number; name: string; short_name?: string | null; tla?: string | null; crest?: string | null };
        Update: Partial<Database["public"]["Tables"]["teams"]["Insert"]>;
      };
      players: {
        Row: {
          id: number;
          name: string;
          nationality: string | null;
          team_id: number | null;
          team_name: string | null;
          position: string | null;
          updated_at: string;
        };
        Insert: { id: number; name: string; nationality?: string | null; team_id?: number | null; team_name?: string | null; position?: string | null };
        Update: Partial<Database["public"]["Tables"]["players"]["Insert"]>;
      };
      standings: {
        Row: {
          id: number;
          group_name: string;
          position: number;
          team_id: number | null;
          team_name: string;
          team_crest: string | null;
          played_games: number;
          won: number;
          draw: number;
          lost: number;
          goals_for: number;
          goals_against: number;
          points: number;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["standings"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["standings"]["Insert"]>;
      };
    };
    Views: {
      leaderboard: {
        Row: {
          league_id: string;
          user_id: string;
          display_name: string;
          avatar_url: string | null;
          total_points: number;
          perfects: number;
          predictions_made: number;
        };
      };
    };
    Functions: {
      join_league_by_code: { Args: { _code: string }; Returns: string };
      score_match: { Args: { _match_id: string }; Returns: void };
      score_bonus: { Args: { _kind: BonusKind }; Returns: void };
    };
    Enums: { app_role: AppRole; match_stage: MatchStage; match_status: MatchStatus; bonus_kind: BonusKind };
  };
}