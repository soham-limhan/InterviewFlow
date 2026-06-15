import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { FirebaseService } from '../../core/firebase/firebase.service';
import * as path from 'path';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  constructor(private readonly firebaseService: FirebaseService) {}

  async uploadResume(file: Express.Multer.File, userId: string) {
    if (!this.allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only PDF and DOCX files are supported');
    }

    const fileId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const extension = path.extname(file.originalname);
    const destination = `resumes/${userId}/${fileId}${extension}`;

    const bucket = this.firebaseService.bucket;
    const fileRef = bucket.file(destination);

    await fileRef.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
        metadata: {
          originalName: file.originalname,
          userId,
          uploadedAt: new Date().toISOString(),
        },
      },
    });

    // Make publicly accessible
    await fileRef.makePublic();
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destination}`;

    // Extract text from resume
    let resumeText = '';
    try {
      resumeText = await this.extractText(file);
    } catch (e) {
      this.logger.warn(`Text extraction failed: ${e}`);
    }

    return {
      url: publicUrl,
      fileId,
      fileName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      resumeText,
    };
  }

  private async extractText(file: Express.Multer.File): Promise<string> {
    if (file.mimetype === 'application/pdf') {
      const pdfParse: any = await import('pdf-parse');
      const parseFunc = pdfParse.default || pdfParse;
      const parsed = await parseFunc(file.buffer);
      return parsed.text;
    }

    if (
      file.mimetype ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      return result.value;
    }

    return '';
  }
}
