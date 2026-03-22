// import type { get } from 'http';
import React, { useState } from 'react'
import { useCallback } from 'react';
import {useDropzone} from 'react-dropzone';
import { formatSize } from '~/lib/utils';

interface FileUploaderProps {
    onFileSelect?: (file: File | null) => void;
}

const FileUploader = ({onFileSelect}: FileUploaderProps) => {
    const [file, setFile] = useState<File | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const selectedFile = acceptedFiles[0] || null;
        setFile(selectedFile);
        onFileSelect?.(selectedFile);
    }, [onFileSelect]);

    const maxFileSize = 20 * 1024 * 1024; // 20MB
    const {getRootProps, getInputProps, isDragActive} = useDropzone({
        onDrop,
        multiple: false,
        accept: {
            'application/pdf': ['.pdf']
        },
        maxSize: maxFileSize,
    });
  
    // const file= acceptedFiles[0] || null;

  return (
    <div className='w-full gradient-border'>
        <div {... getRootProps()}>
            <input {...getInputProps()} />
            <div className='space-y-4 center-pointer'>
                
                {file? (
                    <div className= "uploader-selected-files" onClick={(e) => e.stopPropagation()}> 
                        <div className="flex items-center space-x-3">
                        <img src="/images/pdf.png" alt="pdf icon" className="size-10"/>
                        <div> 
                            <p className="text-lg text-gray-700 font medium truncate">
                            {file.name}
                        </p>
                        <p className="text-sm text-gray-500">
                            {formatSize(file.size)}
                        </p>
                        </div>
                        
                    </div>
                    <button className='p-2 cursor-pointer'>
                        <img src='/icons/cross.svg' alt='remove file' className='w-4' onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                            onFileSelect?.(null);
                        }} />
                    </button>
                    </div>
                    

                ):(
                    <div>
                        <div className='mx-auto w-16 h-16 flex items-center justify-center mb-2'>
                        <img src="/icons/info.svg" alt="upload" className="size-20"/>
                    </div>
                        <p className='text-lg text-gray-500'>
                            <span className='font-semibold'>
                                click to upload or drag and drop your resume here
                            </span>
                        </p>
                        <p className='text-lg text-gray-500'>PDF(max {formatSize(maxFileSize)})</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  )
}

export default FileUploader