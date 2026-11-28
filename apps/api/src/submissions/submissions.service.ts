import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ApplicationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateStorySubmissionDto,
  MAX_SUBMISSION_ZIP_BYTES,
} from './dto/create-story-submission.dto';

@Injectable()
export class SubmissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateStorySubmissionDto, userId?: string) {
    if (!input.acknowledgedNote) {
      throw new BadRequestException(
        'You must accept the 30-day review and analysis notice before uploading.',
      );
    }

    if (!/\.zip$/i.test(input.archiveFileName)) {
      throw new BadRequestException('Only *.ZIP archive files are accepted.');
    }

    if (
      input.archiveSizeBytes !== undefined &&
      input.archiveSizeBytes > MAX_SUBMISSION_ZIP_BYTES
    ) {
      throw new BadRequestException('Archive file size must not exceed 500 MB.');
    }

    const submission = await this.prisma.storySubmission.create({
      data: {
        userId: userId ?? null,
        username: input.username.trim(),
        email: input.email.trim().toLowerCase(),
        bookTitle: input.bookTitle.trim(),
        authorName: input.authorName.trim(),
        narratorName: input.narratorName?.trim() || null,
        archiveUrl: input.archiveUrl.trim(),
        archiveFileName: input.archiveFileName.trim(),
        archiveSizeBytes:
          input.archiveSizeBytes !== undefined
            ? BigInt(input.archiveSizeBytes)
            : null,
        acknowledgedNote: true,
        status: ApplicationStatus.PENDING,
      },
      select: {
        id: true,
        bookTitle: true,
        authorName: true,
        status: true,
        createdAt: true,
      },
    });

    return {
      success: true,
      submission,
      message:
        'Your story submission has been received and queued for review. It may take up to 30 days to upload the book after analysis.',
    };
  }

  async listAll(status?: ApplicationStatus) {
    const items = await this.prisma.storySubmission.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return items.map((item) => ({
      ...item,
      archiveSizeBytes: item.archiveSizeBytes
        ? Number(item.archiveSizeBytes)
        : null,
    }));
  }

  async review(
    id: string,
    decision: 'APPROVED' | 'REJECTED',
    reviewerId: string,
    reviewNote?: string,
  ) {
    const existing = await this.prisma.storySubmission.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException('Story submission not found.');
    }

    const updated = await this.prisma.storySubmission.update({
      where: { id },
      data: {
        status:
          decision === 'APPROVED'
            ? ApplicationStatus.APPROVED
            : ApplicationStatus.REJECTED,
        reviewedById: reviewerId,
        reviewedAt: new Date(),
        reviewNote: reviewNote?.trim() || null,
      },
    });

    return {
      ...updated,
      archiveSizeBytes: updated.archiveSizeBytes
        ? Number(updated.archiveSizeBytes)
        : null,
    };
  }
}
