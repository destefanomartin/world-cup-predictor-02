import { Header } from "@/components/app/Header";
import { AvatarUpload } from "@/components/app/AvatarUpload";

const Profile = () => (
    <div className="min-h-screen bg-background font-sans text-foreground">
        <Header />
        <main className="container py-16 max-w-md">
            <h1 className="font-display text-3xl font-bold mb-8">Your Profile</h1>
            <div className="rounded-2xl border border-border/60 bg-gradient-card p-6 shadow-elegant">
                <AvatarUpload />
            </div>
        </main>
    </div>
);

export default Profile;