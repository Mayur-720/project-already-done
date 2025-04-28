import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Heart,
  MessageSquare,
  Share2,
  MoreHorizontal,
  Music,
  Image,
  Video,
  Volume2,
  VolumeX,
  ArrowUpCircle,
  ArrowDownCircle,
  Flag,
  Eye,
  X,
  Loader2,
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useAuth } from '@/context/AuthContext';
import {
  likePost,
  deletePost,
  updatePost,
  getPostById,
  incrementShareCount
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import SpotifyMusicSelector from '../spotify/SpotifyMusicSelector';
import { SpotifyTrack } from '@/types';
import { AspectRatio } from '../ui/aspect-ratio';
import AvatarGenerator from '../user/AvatarGenerator';
import GuessIdentityModal from '../recognition/GuessIdentityModal';
import { User } from '@/types';

interface PostCardProps {
  postId: string;
  onPostDeleted?: () => void;
  onPostUpdated?: () => void;
  onRecognitionSuccess?: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ postId, onPostDeleted, onPostUpdated, onRecognitionSuccess }) => {
  const [post, setPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [shareCount, setShareCount] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [isMuted, setIsMuted] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isShareSheetOpen, setIsShareSheetOpen] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);
  const [isGuessModalOpen, setIsGuessModalOpen] = useState(false);
  const [isRecognized, setIsRecognized] = useState(false);
  const [isSubmittingUpdate, setIsSubmittingUpdate] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Array<{type: 'image' | 'video', url: string}>>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [isMuteOriginalAudio, setIsMuteOriginalAudio] = useState(false);
  const [isSpotifySelectorOpen, setIsSpotifySelectorOpen] = useState(false);
  const [isRemovingMusic, setIsRemovingMusic] = useState(false);
  const [isRemovingMedia, setIsRemovingMedia] = useState(false);
  const [isRemovingImage, setIsRemovingImage] = useState(false);
  const [isRemovingVideo, setIsRemovingVideo] = useState(false);
  const [isSavingShare, setIsSavingShare] = useState(false);
  const [isSavingLike, setIsSavingLike] = useState(false);
  const [isSavingComment, setIsSavingComment] = useState(false);
  const [isSavingDelete, setIsSavingDelete] = useState(false);
  const [isSavingReport, setIsSavingReport] = useState(false);
  const [isSavingPin, setIsSavingPin] = useState(false);
  const [isSavingUnpin, setIsSavingUnpin] = useState(false);
  const [isSavingMute, setIsSavingMute] = useState(false);
  const [isSavingUnmute, setIsSavingUnmute] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isSavingShareSheet, setIsSavingShareSheet] = useState(false);
  const [isSavingSpotifySelector, setIsSavingSpotifySelector] = useState(false);
  const [isSavingGuessModal, setIsSavingGuessModal] = useState(false);
  const [isSavingRecognized, setIsSavingRecognized] = useState(false);
  const [isSavingSubmittingUpdate, setIsSavingSubmittingUpdate] = useState(false);
  const [isSavingMedia, setIsSavingMedia] = useState(false);
  const [isSavingMuteOriginalAudio, setIsSavingMuteOriginalAudio] = useState(false);
  const [isSavingSpotifySelectorOpen, setIsSavingSpotifySelectorOpen] = useState(false);
  const [isSavingRemovingMusic, setIsSavingRemovingMusic] = useState(false);
  const [isSavingRemovingMedia, setIsSavingRemovingMedia] = useState(false);
  const [isSavingRemovingImage, setIsSavingRemovingImage] = useState(false);
  const [isSavingRemovingVideo, setIsSavingRemovingVideo] = useState(false);
  const [isSavingShareCount, setIsSavingShareCount] = useState(false);
  const [isSavingLikeCount, setIsSavingLikeCount] = useState(false);
  const [isSavingCommentCount, setIsSavingCommentCount] = useState(false);
  const [isSavingCommentText, setIsSavingCommentText] = useState(false);
  const [isSavingEditMode, setIsSavingEditMode] = useState(false);
  const [isSavingEditedContent, setIsSavingEditedContent] = useState(false);
  const [isSavingDeleting, setIsSavingDeleting] = useState(false);
  const [isSavingLoading, setIsSavingLoading] = useState(false);
  const [isSavingMuted, setIsSavingMuted] = useState(false);
  const [isSavingPost, setIsSavingPost] = useState(false);
  const [isSavingShareSheetOpen, setIsSavingShareSheetOpen] = useState(false);
  const [isSavingSelectedTrack, setIsSavingSelectedTrack] = useState(false);
  const [isSavingGuessModalOpen, setIsSavingGuessModalOpen] = useState(false);
  const [isSavingRecognized, setIsSavingRecognized] = useState(false);
  const [isSavingSelectedMedia, setIsSavingSelectedMedia] = useState(false);
  const [isSavingMediaPreviews, setIsSavingMediaPreviews] = useState(false);
  const [isSavingUploadingMedia, setIsSavingUploadingMedia] = useState(false);
  const [isSavingMuteOriginalAudioState, setIsSavingMuteOriginalAudioState] = useState(false);
  const [isSavingSpotifySelectorState, setIsSavingSpotifySelectorState] = useState(false);
  const [isSavingRemovingMusicState, setIsSavingRemovingMusicState] = useState(false);
  const [isSavingRemovingMediaState, setIsSavingRemovingMediaState] = useState(false);
  const [isSavingRemovingImageState, setIsSavingRemovingImageState] = useState(false);
  const [isSavingRemovingVideoState, setIsSavingRemovingVideoState] = useState(false);
  const [isSavingShareCountState, setIsSavingShareCountState] = useState(false);
  const [isSavingLikeCountState, setIsSavingLikeCountState] = useState(false);
  const [isSavingCommentCountState, setIsSavingCommentCountState] = useState(false);
  const [isSavingCommentTextState, setIsSavingCommentTextState] = useState(false);
  const [isSavingEditModeState, setIsSavingEditModeState] = useState(false);
  const [isSavingEditedContentState, setIsSavingEditedContentState] = useState(false);
  const [isSavingDeletingState, setIsSavingDeletingState] = useState(false);
  const [isSavingLoadingState, setIsSavingLoadingState] = useState(false);
  const [isSavingMutedState, setIsSavingMutedState] = useState(false);
  const [isSavingPostState, setIsSavingPostState] = useState(false);
  const [isSavingShareSheetOpenState, setIsSavingShareSheetOpenState] = useState(false);
  const [isSavingSelectedTrackState, setIsSavingSelectedTrackState] = useState(false);
  const [isSavingGuessModalOpenState, setIsSavingGuessModalOpenState] = useState(false);
  const [isSavingRecognizedState, setIsSavingRecognizedState] = useState(false);
  const [isSavingSelectedMediaState, setIsSavingSelectedMediaState] = useState(false);
  const [isSavingMediaPreviewsState, setIsSavingMediaPreviewsState] = useState(false);
  const [isSavingUploadingMediaState, setIsSavingUploadingMediaState] = useState(false);
  const [isSavingMuteOriginalAudioStateState, setIsSavingMuteOriginalAudioStateState] = useState(false);
  const [isSavingSpotifySelectorStateState, setIsSavingSpotifySelectorStateState] = useState(false);
  const [isSavingRemovingMusicStateState, setIsSavingRemovingMusicStateState] = useState(false);
  const [isSavingRemovingMediaStateState, setIsSavingRemovingMediaStateState] = useState(false);
  const [isSavingRemovingImageStateState, setIsSavingRemovingImageStateState] = useState(false);
  const [isSavingRemovingVideoStateState, setIsSavingRemovingVideoStateState] = useState(false);
  const [isSavingShareCountStateState, setIsSavingShareCountStateState] = useState(false);
  const [isSavingLikeCountStateState, setIsSavingLikeCountStateState] = useState(false);
  const [isSavingCommentCountStateState, setIsSavingCommentCountStateState] = useState(false);
  const [isSavingCommentTextStateState, setIsSavingCommentTextStateState] = useState(false);
  const [isSavingEditModeStateState, setIsSavingEditModeStateState] = useState(false);
  const [isSavingEditedContentStateState, setIsSavingEditedContentStateState] = useState(false);
  const [isSavingDeletingStateState, setIsSavingDeletingStateState] = useState(false);
  const [isSavingLoadingStateState, setIsSavingLoadingStateState] = useState(false);
  const [isSavingMutedStateState, setIsSavingMutedStateState] = useState(false);
  const [isSavingPostStateState, setIsSavingPostStateState] = useState(false);
  const [isSavingShareSheetOpenStateState, setIsSavingShareSheetOpenStateState] = useState(false);
  const [isSavingSelectedTrackStateState, setIsSavingSelectedTrackStateState] = useState(false);
  const [isSavingGuessModalOpenStateState, setIsSavingGuessModalOpenStateState] = useState(false);
  const [isSavingRecognizedStateState, setIsSavingRecognizedStateState] = useState(false);
  const [isSavingSelectedMediaStateState, setIsSavingSelectedMediaStateState] = useState(false);
  const [isSavingMediaPreviewsStateState, setIsSavingMediaPreviewsStateState] = useState(false);
  const [isSavingUploadingMediaStateState, setIsSavingUploadingMediaStateState] = useState(false);
  const [isSavingMuteOriginalAudioStateStateState, setIsSavingMuteOriginalAudioStateStateState] = useState(false);
  const [isSavingSpotifySelectorStateStateState, setIsSavingSpotifySelectorStateStateState] = useState(false);
  const [isSavingRemovingMusicStateStateState, setIsSavingRemovingMusicStateStateState] = useState(false);
  const [isSavingRemovingMediaStateStateState, setIsSavingRemovingMediaStateStateState] = useState(false);
  const [isSavingRemovingImageStateStateState, setIsSavingRemovingImageStateStateState] = useState(false);
  const [isSavingRemovingVideoStateStateState, setIsSavingRemovingVideoStateStateState] = useState(false);
  const [isSavingShareCountStateStateState, setIsSavingShareCountStateStateState] = useState(false);
  const [isSavingLikeCountStateStateState, setIsSavingLikeCountStateStateState] = useState(false);
  const [isSavingCommentCountStateStateState, setIsSavingCommentCountStateStateState] = useState(false);
  const [isSavingCommentTextStateStateState, setIsSavingCommentTextStateStateState] = useState(false);
  const [isSavingEditModeStateStateState, setIsSavingEditModeStateStateState] = useState(false);
  const [isSavingEditedContentStateStateState, setIsSavingEditedContentStateStateState] = useState(false);
  const [isSavingDeletingStateStateState, setIsSavingDeletingStateStateState] = useState(false);
  const [isSavingLoadingStateStateState, setIsSavingLoadingStateStateState] = useState(false);
  const [isSavingMutedStateStateState, setIsSavingMutedStateStateState] = useState(false);
  const [isSavingPostStateStateState, setIsSavingPostStateStateState] = useState(false);
  const [isSavingShareSheetOpenStateStateState, setIsSavingShareSheetOpenStateStateState] = useState(false);
  const [isSavingSelectedTrackStateStateState, setIsSavingSelectedTrackStateStateState] = useState(false);
  const [isSavingGuessModalOpenStateStateState, setIsSavingGuessModalOpenStateStateState] = useState(false);
  const [isSavingRecognizedStateStateState, setIsSavingRecognizedStateStateState] = useState(false);
  const [isSavingSelectedMediaStateStateState, setIsSavingSelectedMediaStateStateState] = useState(false);
  const [isSavingMediaPreviewsStateStateState, setIsSavingMediaPreviewsStateStateState] = useState(false);
  const [isSavingUploadingMediaStateStateState, setIsSavingUploadingMediaStateStateState] = useState(false);
  const [isSavingMuteOriginalAudioStateStateStateState, setIsSavingMuteOriginalAudioStateStateStateState] = useState(false);
  const [isSavingSpotifySelectorStateStateStateState, setIsSavingSpotifySelectorStateStateStateState] = useState(false);
  const [isSavingRemovingMusicStateStateStateState, setIsSavingRemovingMusicStateStateStateState] = useState(false);
  const [isSavingRemovingMediaStateStateStateState, setIsSavingRemovingMediaStateStateStateState] = useState(false);
  const [isSavingRemovingImageStateStateStateState, setIsSavingRemovingImageStateStateStateState] = useState(false);
  const [isSavingRemovingVideoStateStateStateState, setIsSavingRemovingVideoStateStateStateState] = useState(false);
  const [isSavingShareCountStateStateStateState, setIsSavingShareCountStateStateStateState] = useState(false);
  const [isSavingLikeCountStateStateStateState, setIsSavingLikeCountStateStateStateState] = useState(false);
  const [isSavingCommentCountStateStateStateState, setIsSavingCommentCountStateStateStateState] = useState(false);
  const [isSavingCommentTextStateStateStateState, setIsSavingCommentTextStateStateStateState] = useState(false);
  const [isSavingEditModeStateStateStateState, setIsSavingEditModeStateStateStateState] = useState(false);
  const [isSavingEditedContentStateStateStateState, setIsSavingEditedContentStateStateStateState] = useState(false);
  const [isSavingDeletingStateStateStateState, setIsSavingDeletingStateStateStateState] = useState(false);
  const [isSavingLoadingStateStateStateState, setIsSavingLoadingStateStateStateState] = useState(false);
  const [isSavingMutedStateStateStateState, setIsSavingMutedStateStateStateState] = useState(false);
  const [isSavingPostStateStateStateState, setIsSavingPostStateStateStateState] = useState(false);
  const [isSavingShareSheetOpenStateStateStateState, setIsSavingShareSheetOpenStateStateStateState] = useState(false);
  const [isSavingSelectedTrackStateStateStateState, setIsSavingSelectedTrackStateStateStateState] = useState(false);
  const [isSavingGuessModalOpenStateStateStateState, setIsSavingGuessModalOpenStateStateStateState] = useState(false);
  const [isSavingRecognizedStateStateStateState, setIsSavingRecognizedStateStateStateState] = useState(false);
  const [isSavingSelectedMediaStateStateStateState, setIsSavingSelectedMediaStateStateStateState] = useState(false);
  const [isSavingMediaPreviewsStateStateStateState, setIsSavingMediaPreviewsStateStateStateState] = useState(false);
  const [isSavingUploadingMediaStateStateStateState, setIsSavingUploadingMediaStateStateStateState] = useState(false);
  const [isSavingMuteOriginalAudioStateStateStateStateState, setIsSavingMuteOriginalAudioStateStateStateStateState] = useState(false);
  const [isSavingSpotifySelectorStateStateStateStateState, setIsSavingSpotifySelectorStateStateStateStateState] = useState(false);
  const [isSavingRemovingMusicStateStateStateStateState, setIsSavingRemovingMusicStateStateStateStateState] = useState(false);
  const [isSavingRemovingMediaStateStateStateStateState, setIsSavingRemovingMediaStateStateStateStateState] = useState(false);
  const [isSavingRemovingImageStateStateStateStateState, setIsSavingRemovingImageStateStateStateStateState] = useState(false);
  const [isSavingRemovingVideoStateStateStateStateState, setIsSavingRemovingVideoStateStateStateStateState] = useState(false);
  const [isSavingShareCountStateStateStateStateState, setIsSavingShareCountStateStateStateStateState] = useState(false);
  const [isSavingLikeCountStateStateStateStateState, setIsSavingLikeCountStateStateStateStateState] = useState(false);
  const [isSavingCommentCountStateStateStateStateState, setIsSavingCommentCountStateStateStateStateState] = useState(false);
  const [isSavingCommentTextStateStateStateStateState, setIsSavingCommentTextStateStateStateStateState] = useState(false);
  const [isSavingEditModeStateStateStateStateState, setIsSavingEditModeStateStateStateStateState] = useState(false);
  const [isSavingEditedContentStateStateStateStateState, setIsSavingEditedContentStateStateStateStateState] = useState(false);
  const [isSavingDeletingStateStateStateStateState, setIsSavingDeletingStateStateStateStateState] = useState(false);
  const [isSavingLoadingStateStateStateStateState, setIsSavingLoadingStateStateStateStateState] = useState(false);
  const [isSavingMutedStateStateStateStateState, setIsSavingMutedStateStateStateStateState] = useState(false);
  const [isSavingPostStateStateStateStateState, setIsSavingPostStateStateStateStateState] = useState(false);
  const [isSavingShareSheetOpenStateStateStateStateState, setIsSavingShareSheetOpenStateStateStateStateState] = useState(false);
  const [isSavingSelectedTrackStateStateStateStateState, setIsSavingSelectedTrackStateStateStateStateState] = useState(false);
  const [isSavingGuessModalOpenStateStateStateStateState, setIsSavingGuessModalOpenStateStateStateStateState] = useState(false);
  const [isSavingRecognizedStateStateStateStateState, setIsSavingRecognizedStateStateStateStateState] = useState(false);
  const [isSavingSelectedMediaStateStateStateStateState, setIsSavingSelectedMediaStateStateStateStateState] = useState(false);
  const [isSavingMediaPreviewsStateStateStateStateState, setIsSavingMediaPreviewsStateStateStateStateState] = useState(false);
  const [isSavingUploadingMediaStateStateStateStateState, setIsSavingUploadingMediaStateStateStateStateState] = useState(false);
  const [isSavingMuteOriginalAudioStateStateStateStateStateState, setIsSavingMuteOriginalAudioStateStateStateStateStateState] = useState(false);
  const [isSavingSpotifySelectorStateStateStateStateStateState, setIsSavingSpotifySelectorStateStateStateStateStateState] = useState(false);
  const [isSavingRemovingMusicStateStateStateStateStateState, setIsSavingRemovingMusicStateStateStateStateStateState] = useState(false);
  const [isSavingRemovingMediaStateStateStateStateStateState, setIsSavingRemovingMediaStateStateStateStateStateState] = useState(false);
  const [isSavingRemovingImageStateStateStateStateStateState, setIsSavingRemovingImageStateStateStateStateStateState] = useState(false);
  const [isSavingRemovingVideoStateStateStateStateStateState, setIsSavingRemovingVideoStateStateStateStateStateState] = useState(false);
  const [isSavingShareCountStateStateStateStateStateState, setIsSavingShareCountStateStateStateStateStateState] = useState(false);
  const [isSavingLikeCountStateStateStateStateStateState, setIsSavingLikeCountStateStateStateStateStateState] = useState(false);
  const [isSavingCommentCountStateStateStateStateStateState, setIsSavingCommentCountStateStateStateStateStateState] = useState(false);
  const [isSavingCommentTextStateStateStateStateStateState, setIsSavingCommentTextStateStateStateStateStateState] = useState(false);
  const [isSavingEditModeStateStateStateStateStateState, setIsSavingEditModeStateStateStateStateStateState] = useState(false);
  const [isSavingEditedContentStateStateStateStateStateState, setIsSavingEditedContentStateStateStateStateStateState] = useState(false);
  const [isSavingDeletingStateStateStateStateStateState, setIsSavingDeletingStateStateStateStateStateState] = useState(false);
  const [isSavingLoadingStateStateStateStateStateState, setIsSavingLoadingStateStateStateStateStateState] = useState(false);
  const [isSavingMutedStateStateStateStateStateState, setIsSavingMutedStateStateStateStateStateState] = useState(false);
  const [isSavingPostStateStateStateStateStateState, setIsSavingPostStateStateStateStateStateState] = useState(false);
  const [isSavingShareSheetOpenStateStateStateStateStateState, setIsSavingShareSheetOpenStateStateStateStateStateState] = useState(false);
  const [isSavingSelectedTrackStateStateStateStateStateState, setIsSavingSelectedTrackStateStateStateStateStateState] = useState(false);
  const [isSavingGuessModalOpenStateStateStateStateStateState, setIsSavingGuessModalOpenStateStateStateStateStateState] = useState(false);
  const [isSavingRecognizedStateStateStateStateStateState, setIsSavingRecognizedStateStateStateStateStateState] = useState(false);
  const [isSavingSelectedMediaStateStateStateStateStateState, setIsSavingSelectedMediaStateStateStateStateStateState] = useState(false);
  const [isSavingMediaPreviewsStateStateStateStateStateState, setIsSavingMediaPreviewsStateStateStateStateStateState] = useState(false);
  const [isSavingUploadingMediaStateStateStateStateStateState, setIsSavingUploadingMediaStateStateStateStateStateState] = useState(false);
  const [isSavingMuteOriginalAudioStateStateStateStateStateStateState, setIsSavingMuteOriginalAudioStateStateStateStateStateStateState] = useState(false);
  const [isSavingSpotifySelectorStateStateStateStateStateStateState, setIsSavingSpotifySelectorStateStateStateStateStateStateState] = useState(false);
  const [isSavingRemovingMusicStateStateStateStateStateStateState, setIsSavingRemovingMusicStateStateStateStateStateStateState] = useState(false);
  const [isSavingRemovingMediaStateStateStateStateStateStateState, setIsSavingRemovingMediaStateStateStateStateStateStateState] = useState(false);
  const [isSavingRemovingImageStateStateStateStateStateStateState, setIsSavingRemovingImageStateStateStateStateStateStateState] = useState(false);
  const [isSavingRemovingVideoStateStateStateStateStateStateState, setIsSavingRemovingVideoStateStateStateStateStateStateState] = useState(false);
  const [isSavingShareCountStateStateStateStateStateStateState, setIsSavingShareCountStateStateStateStateStateStateState] = useState(false);
  const [isSavingLikeCountStateStateStateStateStateStateState, setIsSavingLikeCountStateStateStateStateStateStateState] = useState(false);
  const [isSavingCommentCountStateStateStateStateStateStateState, setIsSavingCommentCountStateStateStateStateStateStateState] = useState(false);
  const [isSavingCommentTextStateStateStateStateStateStateState, setIsSavingCommentTextStateStateStateStateStateStateState] = useState(false);
  const [isSavingEditModeStateStateStateStateStateStateState, setIsSavingEditModeStateStateStateStateStateStateState] = useState(false);
  const [isSavingEditedContentStateStateStateStateStateStateState, setIsSavingEditedContentStateStateStateStateStateStateState] = useState(false);
  const [isSavingDeletingStateStateStateStateStateStateState, setIsSavingDeletingStateStateStateStateStateStateState] = useState(false);
  const [isSavingLoadingStateStateStateStateStateStateState, setIsSavingLoadingStateStateStateStateStateStateState] = useState(false);
  const [isSavingMutedStateStateStateStateStateStateState, setIsSavingMutedStateStateStateStateStateStateState] = useState(false);
  const [isSavingPostStateStateStateStateStateStateState, setIsSavingPostStateStateStateStateStateStateState] = useState(false);
  const [isSavingShareSheetOpenStateStateStateStateStateStateState, setIsSavingShareSheetOpenStateStateStateStateStateStateState] = useState(false);
  const [isSavingSelectedTrackStateStateStateStateStateStateState, setIsSavingSelectedTrackStateStateStateStateStateStateState] = useState(false);
  const [isSavingGuessModalOpenStateStateStateStateStateStateState, setIsSavingGuessModalOpenStateStateStateStateStateStateState] = useState(false);
  const [isSavingRecognizedStateStateStateStateStateStateState, setIsSavingRecognizedStateStateStateStateStateStateState] = useState(false);
  const [isSavingSelectedMediaStateStateStateStateStateStateState, setIsSavingSelectedMediaStateStateStateStateStateStateState] = useState(false);
  const [isSavingMediaPreviewsStateStateStateStateStateStateState, setIsSavingMediaPreviewsStateStateStateStateStateStateState] = useState(false);
  const [isSavingUploadingMediaStateStateStateStateStateStateState, setIsSavingUploadingMediaStateStateStateStateStateStateState] = useState(false);
  const [isSavingMuteOriginalAudioStateStateStateStateStateStateStateState, setIsSavingMuteOriginalAudioStateStateStateStateStateStateStateState] = useState(false);
  const [isSavingSpotifySelectorStateStateStateStateStateStateStateState, setIsSavingSpotifySelectorStateStateStateStateStateStateStateState] = useState(false);
  const [isSavingRemovingMusicStateStateStateStateStateStateStateState, setIsSavingRemovingMusicStateStateStateStateStateStateStateState] = useState(false);
  const [isSavingRemovingMediaStateStateStateStateStateStateStateState, setIsSavingRemovingMediaStateStateStateStateStateStateStateState] = useState(false);
  const [isSavingRemovingImageStateStateStateStateStateStateStateState, setIsSavingRemovingImageStateStateStateStateStateStateStateState] = useState(false);
  const [isSavingRemovingVideoStateStateStateStateStateStateStateState, setIsSavingRemovingVideoStateStateStateStateStateStateStateState] = useState(false);
  const [isSavingShareCountStateStateStateStateStateStateStateState, setIsSavingShareCountStateStateStateStateStateStateStateState] = useState(false);
  const [isSavingLikeCountStateStateStateStateStateStateStateState, setIsSavingLikeCountStateStateStateStateStateStateStateState] = useState(false);
  const [isSavingCommentCountStateStateStateStateStateStateStateState, setIsSavingCommentCountStateStateStateStateStateStateStateState] = useState(false);
  const [isSavingCommentTextStateStateStateStateStateStateStateState, setIsSavingCommentTextStateStateStateStateStateStateStateState] = useState(false);
  const [isSavingEditModeStateStateStateStateStateStateStateState, setIsSavingEditModeStateStateStateStateStateStateStateState] = useState(false);
  const [isSavingEditedContentStateStateStateStateStateStateStateState, setIsSavingEditedContentStateStateStateStateStateStateStateState] = useState(false);
  const [isSavingDeletingStateStateStateStateStateStateStateState, setIsSavingDeletingStateStateStateStateStateStateStateState] = useState(false);
  const [isSavingLoadingStateStateStateStateStateStateStateState, setIsSavingLoadingStateStateStateStateStateStateStateState] = useState(false);
  const [isSavingMutedStateStateStateStateStateStateStateState, setIsSavingMutedStateStateStateStateStateStateStateState] = useState(false);
  const [isSavingPostStateStateStateStateStateStateStateState, setIsSavingPostStateStateStateStateStateStateStateState] = useState(false);
  const [isSavingShareSheetOpenStateStateStateStateStateStateStateState, setIsSavingShareSheetOpenStateStateStateStateStateStateStateState] = useState(false);
  const [isSavingSelectedTrackStateStateStateStateStateStateStateState, setIsSavingSelectedTrackStateStateStateStateStateStateStateState] = useState(false);
  const [isSavingGuessModalOpenStateStateStateStateStateStateStateState, setIsSavingGuessModalOpenStateStateStateStateStateStateStateState] = useState(false);
  const [isSavingRecognizedStateStateStateStateStateStateStateState, setIsSavingRecognizedStateStateStateStateStateStateStateState] = useState(false);
  const [isSavingSelectedMediaStateStateStateStateStateStateStateState, setIsSavingSelectedMediaStateStateStateStateStateStateStateState] = useState(false);
  const [isSavingMediaPreviewsStateStateStateStateStateStateStateState, setIsSavingMediaPreviewsStateStateStateStateStateStateStateState] = useState(false);
  const [isSavingUploadingMediaStateStateStateStateStateStateStateState, setIsSavingUploadingMediaStateStateStateStateStateStateStateState] = useState(false);
  const [isSavingMuteOriginalAudioStateStateStateStateStateStateStateStateState, setIsSavingMuteOriginalAudioStateStateStateStateStateStateStateStateState] = useState(false);
  const [isSavingSpotifySelectorStateStateStateStateStateStateStateStateState, setIsSavingSpotifySelectorStateStateStateStateStateStateStateStateState] = useState(false);
  const [isSavingRemovingMusicStateStateStateStateStateStateStateStateState, setIsSavingRemovingMusicStateStateStateStateStateStateStateStateState] = useState(false);
  const [isSavingRemovingMediaStateStateStateStateStateStateStateStateState, setIsSavingRemovingMediaStateStateStateStateStateStateStateStateState] = useState(false);
  const [isSavingRemovingImageStateStateStateStateStateStateStateStateState, setIsSavingRemovingImageStateStateStateStateStateStateStateStateState] = useState(false);
  const [isSavingRemovingVideoStateStateStateStateStateStateStateStateState, setIsSavingRemovingVideoStateStateStateStateStateStateStateStateState] = useState(false);
  const [isSavingShareCountStateStateStateStateStateStateStateStateState, setIsSavingShareCountStateStateStateStateStateStateStateStateState] = useState(false);
  const [isSavingLikeCountStateStateStateStateStateStateStateStateState, setIsSavingLikeCountStateStateStateStateStateStateStateStateState] = useState(false);
  const [isSavingCommentCountStateStateStateStateStateStateStateStateState, setIsSavingCommentCountStateStateStateStateStateStateStateStateState] = useState(false);
  const [isSavingCommentTextStateStateStateStateStateStateStateStateState, setIsSavingCommentTextStateStateStateStateStateStateStateStateState] = useState(false);
  const [isSavingEditModeStateStateStateStateStateStateStateStateState, setIsSavingEditModeStateStateStateStateStateStateStateStateState] = useState(false);
  const [isSavingEditedContentStateStateStateStateStateStateStateStateState, setIsSavingEditedContentStateStateStateStateStateStateStateStateState] = useState(false);
  const [isSavingDeletingStateStateStateStateStateStateStateStateState, setIsSavingDeletingStateStateStateStateStateStateStateStateState] = useState(false);
  const [isSavingLoadingStateStateStateStateStateStateStateStateState, setIsSavingLoadingStateStateStateStateStateStateStateStateState] = useState(false);
  const [isSavingMutedStateStateStateStateStateStateStateStateState, setIsSavingMutedStateStateStateStateStateStateStateStateState] = useState(false);
  const [isSavingPostStateStateStateStateStateStateStateStateState, setIsSavingPostStateStateStateStateStateStateStateStateState] = useState(false);
  const [isSavingShareSheetOpenStateStateStateStateStateStateStateStateState, setIsSavingShareSheetOpenStateStateStateStateStateStateStateStateState] = useState(false);
  const [isSavingSelectedTrackStateStateStateStateStateStateStateStateState, setIsSavingSelectedTrackStateStateStateStateStateStateStateStateState] = useState(false);
  const [isSavingGuessModalOpenStateStateStateStateStateStateStateStateState, setIsSavingGuessModalOpenStateStateStateStateStateStateStateStateState] = useState(false);
  const [isSavingRecognizedStateStateStateStateStateStateStateStateState, setIsSavingRecognizedStateStateStateStateStateStateStateStateState] = useState(false);
  const [isSavingSelectedMediaStateStateStateStateStateStateStateStateState, setIsSavingSelectedMediaStateStateStateStateStateStateStateStateState] = useState(false);
  const [isSavingMediaPreviewsStateStateStateStateStateStateStateStateState, setIsSavingMediaPreviewsStateStateStateStateStateStateStateStateState] = useState(false);
  const [isSavingUploadingMediaStateStateStateStateStateStateStateStateState, setIsSavingUploadingMediaStateStateStateStateStateStateStateStateState] = useState(false);
  const [isSavingMuteOriginalAudioStateStateStateStateStateStateStateStateStateState, setIsSavingMuteOriginalAudioStateStateStateStateStateStateStateStateStateState] = useState(false);
  const [isSavingSpotifySelectorStateStateStateStateStateStateStateStateStateState, setIsSavingSpotifySelectorStateStateStateStateStateStateStateStateStateState] = useState(false);
  const [isSavingRemovingMusicStateStateStateStateStateStateStateStateStateState, setIsSavingRemovingMusicStateStateStateStateStateStateStateStateStateState] = useState(false);
  const [isSavingRemovingMediaStateStateStateStateStateStateStateStateStateState, setIsSavingRemovingMediaStateStateStateStateStateStateStateStateStateState] = useState(false);
  const [isSavingRemovingImageStateStateStateStateStateStateStateStateStateState, setIsSavingRemovingImageStateStateStateStateStateStateStateStateStateState] = useState(false);
  const [isSavingRemovingVideoStateStateStateStateStateStateStateStateStateState, setIsSavingRemovingVideoStateStateStateStateStateStateStateStateStateState] = useState(false);
  const [isSavingShareCountStateStateStateStateStateStateStateStateStateState, setIsSavingShareCountStateStateStateStateStateStateStateStateStateState] = useState(false);
  const [isSavingLikeCountStateStateStateStateStateStateStateStateStateState, setIsSavingLikeCountStateStateStateStateStateStateStateStateStateState] = useState(false);
  const [isSavingCommentCountStateStateStateStateStateStateStateStateStateState, setIsSavingCommentCountStateStateStateStateStateStateStateStateStateState] = useState(false);
  const [isSavingCommentTextStateStateStateStateStateStateStateStateStateState, setIsSavingCommentTextStateStateStateStateStateStateStateStateStateState] = useState(false);
  const [isSavingEditModeStateStateStateStateStateStateStateStateStateState, setIsSavingEditModeStateStateStateStateStateStateStateStateStateState] = useState(false
