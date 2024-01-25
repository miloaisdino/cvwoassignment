// src/components/PostDetails.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiInstance, ApiErrorAlert } from '../utils/api';
import { Typography, Button, TextField, Box, Chip } from '@mui/material';

interface Post {
    id: number;
    author: string;
    content: string;
}

const PostDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [post, setPost] = useState<Post | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [editedContent, setEditedContent] = useState('');
    const [tags, setTags] = useState('');
    const [tagList, setTagList] = useState([]);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await apiInstance.get(`http://localtest.me:8080/posts/${id}`); //inbuilt acl
                setPost(response.data.data);
                setEditedContent(response.data.data.content);
                setTagList(response.data.data.tags.map((tag: { name: string, color: string }) => tag.name));
            } catch (error) {
                console.error('Error fetching post:', error);
            }
        };

        fetchPost();
    }, [id]);

    const handleTagChange = (event: { target: { value: React.SetStateAction<string>; }; }) => {
        setTags(event.target.value);
    };

    const handleAddTag = () => {
        // @ts-ignore
        setTagList([...tagList, tags]);
        setTags('');
    };

    const handleDeleteTag = (tagToDelete: never) => {
        setTagList((prevTags) => prevTags.filter((tag: { name: string, color: string }) => tag !== tagToDelete));
    };

    const handleEditClick = () => {
        setEditMode(true);
    };

    const handleCancelClick = () => {
        setEditMode(false);
        setEditedContent(post?.content || '');
    };

    const handleDelete = async () => {
        try {
            await apiInstance.delete(`http://localtest.me:8080/posts/${id}`);
            // Redirect to the post list after deleting the post
            window.location.replace('/posts')
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };

    const handleSaveClick = async () => {
        try {
            const response = await apiInstance.patch(`http://localtest.me:8080/posts/${id}`, {
                content: editedContent,
                tags: tagList,
            });

            setPost(response.data.data);
            setEditMode(false);
        } catch (error) {
            console.error('Error updating post:', error);
        }
    };

    const tagJsx = (<>
        <Box mb={2}>
            <TextField
                label="Tags"
                variant="outlined"
                fullWidth
                value={tags}
                onChange={handleTagChange}
            />
            <Button variant="contained" color="primary" onClick={handleAddTag} sx={{ marginLeft: 2 }}>
                Add Tag
            </Button>
        </Box>
        <Box display="flex" flexDirection="row" flexWrap="wrap">
            {tagList.map((tag) => (
                <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleDeleteTag(tag)}
                    style={{ margin: '4px', padding: '4px', backgroundColor: '#3498db', color: 'white' }}
                />
            ))}
        </Box>
    </>);


    return (
        <div>
            <ApiErrorAlert />
            {post ? (
                <div>
                    <Typography variant="h6">{post.author}</Typography>
                    {editMode ? (
                        <div>
                            <TextField
                                label="Edit Content"
                                multiline
                                fullWidth
                                variant="outlined"
                                value={editedContent}
                                onChange={(e) => setEditedContent(e.target.value)}
                            />
                            {tagJsx}
                            <Button variant="contained" color="primary" onClick={handleSaveClick}>
                                Save
                            </Button>
                            <Button variant="outlined" onClick={handleCancelClick}>
                                Cancel
                            </Button>
                        </div>

                    ) : (
                        <div>
                            <Typography variant="body1" sx={{pb: 2, pt: 1}}>{post.content}</Typography>
                            <Button variant="contained" onClick={handleEditClick}>
                                Modify
                            </Button>
                        </div>
                    )}
                </div>
            ) : (
                <Typography variant="body1">Loading...</Typography>
            )}
            <Box sx={{pb: 2}}></Box>
            <Button variant="contained" color="error" onClick={handleDelete} sx={{mr: 3}}>
                Delete
            </Button>
            <Button component={Link} to="/posts" variant="contained" color="primary">
                Back to Posts
            </Button>
        </div>
    );
};

export default PostDetails;
