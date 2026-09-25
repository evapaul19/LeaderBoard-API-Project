from enum import Enum

class ActivityType(str, Enum):
    INTERVIEW_PANEL = "Interview Panel"
    OSS_PR_MERGED = "OSS PR merged"
    BLOG_POST = "Blog Post"
    BLOG_5000_VIEWS = "Blog crosses 5,000 views in first 30 days"
    INTERNAL_KNOWLEDGE_SESSION = "Internal knowledge session"
    EXTERNAL_COMMUNITY_EVENT = "External Community Event (Speaker)"
    KUBECON_MAJOR_EVENT = "KubeCon or other Major Event (Speaker)"
    REFERRAL = "Referral"

ACTIVITY_POINTS = {
    ActivityType.INTERVIEW_PANEL: 500,
    ActivityType.OSS_PR_MERGED: 500,
    ActivityType.BLOG_POST: 1000,
    ActivityType.BLOG_5000_VIEWS: 1000,
    ActivityType.INTERNAL_KNOWLEDGE_SESSION: 1000,
    ActivityType.EXTERNAL_COMMUNITY_EVENT: 2000,
    ActivityType.KUBECON_MAJOR_EVENT: 5000,
    ActivityType.REFERRAL: 5000,
}