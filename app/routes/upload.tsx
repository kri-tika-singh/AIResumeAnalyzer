// import { KV } from '@heyputer/puter.js';
import { prepareInstructions, AIResponseFormat } from 'constants/index';
import React, { useCallback, useState } from 'react'
import { useNavigate } from 'react-router';
import Navbar from '~/components/Navbar'
import FileUploader from '~/components/fileUploader'
import { convertPdfToImage } from '~/lib/pdftoimg';
import { usePuterStore } from '~/lib/puter';
import { generateUUID } from '~/lib/utils';

const Upload = () => {
    const Navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState("Upload your resume to get started!");
    const [file, setFile] = useState<File | null>(null);
    const { fs, kv, ai } = usePuterStore();

    const handleFileSelect = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0] || null;
    setFile(file);
    }, []);

    const handleAnalyze = async({companyName, jobTitle, jobDescription, file}: {companyName: string, jobTitle: string, jobDescription: string, file: File | null}) => {
        if (!file) return setStatusText("No file selected.");
        
        setIsProcessing(true);
        setStatusText("Analyzing your resume...");
        
        const uploadedFile = await fs.upload([file]);

        if(!uploadedFile) return setStatusText("Failed to upload resume.");

        setStatusText('converting to image...');
        const imageFile = await convertPdfToImage(file);
        if(!imageFile.file) return setStatusText("Failed to convert PDF to image.");

        setStatusText('Uploading image...');
        const uploadedImage = await fs.upload([imageFile.file]);
        if(!uploadedImage) return setStatusText("Failed to upload resume image.");
        
        setStatusText('preparing data...');
        const uuid = generateUUID();
        const data = {
            id: uuid,
            resumePath: uploadedFile.path,
            imagePath: uploadedImage.path,
            companyName,
            jobTitle,
            jobDescription,
            feedback:'',
        }
        await kv.set(`resume:${uuid}`, JSON.stringify(data));
        setStatusText('Analyzing...');

        const feedback = await ai.feedback(
            uploadedImage.path,
            prepareInstructions({ jobTitle, jobDescription, AIResponseFormat }),
        );
        if(!feedback) return setStatusText('Error - Failed to Analyze');

        const feedbackText = typeof feedback.message.content === 'string'
            ? feedback.message.content
            : feedback.message.content[0].text;

            data.feedback = JSON.parse(feedbackText);
            await kv.set(`resume:${uuid}`, JSON.stringify(data));
            setStatusText('Analysis complete, redirecting...');
            console.log(data);
            Navigate(`/resume/${uuid}`);
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget.closest('form');
      if(!form) return;
      const formData = new FormData(e.currentTarget);


      const companyName = formData.get('company-name') as string;
      const jobTitle = formData.get('job-title') as string;
      const jobDescription = formData.get('job-description') as string;
      console.log({
        companyName,
        jobTitle,
        jobDescription,
      })

      if(!file) return;

      handleAnalyze({companyName, jobTitle, jobDescription, file})
    }

    return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
    <Navbar/>
      <section className="main-section">
        <div className='page-heading py-16'>
            <h1> Smart Feedback for your dream job</h1>
            {isProcessing ? (
                <>
                <h2>{statusText}</h2>
                <img src='/images/resume-scan.gif' className='w-full'></img>
                </>
            ):(
                <h2>Drop your resume for an ATS Score and Improvement Test</h2>
            )}
            {!isProcessing &&(
                <form id='upload-form' onSubmit={handleSubmit} className='flex flex-col gap-4 mt-8' >
                    <div className='form-div'>
                        <label htmlFor="company-name">Company Name</label>
                        <input type="text" id="company-name" placeholder="company name" />
                    </div>
                    <div className='form-div'>
                        <label htmlFor="job-title">Job Title</label>
                        <input type="text" id="job-title" placeholder="job title" />
                    </div>
                    <div className='form-div'>
                        <label htmlFor="job-description">Job Description</label>
                        <textarea rows={5} id="job-description" placeholder="job description" />
                    </div>
                    <div className='form-div'>
                        <label htmlFor='uploader'>Upload Resume</label>
                        <FileUploader onFileSelect={setFile} />
                    </div>
                    <button className='primary-button' type='submit'>
                        Analyze Resume
                    </button>
                </form>
            )}
        </div>
      </section>
    </main>
  )
}

export default Upload