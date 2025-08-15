export const Constants = {
    public: {
        Enums: {
            match_status: ["pending", "accepted", "rejected"],
            payment_status: [
                "pending",
                "completed",
                "failed",
                "refunded",
                "cancelled",
            ],
            security_severity: ["low", "medium", "high", "critical"],
            user_role: ["user", "moderator", "admin", "super_admin"],
        },
    },
};
