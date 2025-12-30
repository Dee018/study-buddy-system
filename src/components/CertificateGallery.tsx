import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

import { Certificate, CertificateData } from './Certificate';
import { CertificateService } from '../utils/certificateService';
import {
  Award,
  Trophy,
  Star,
  Sparkles,
  Calendar,
  Download,
  Eye,

  Search,
  FileText
} from 'lucide-react';
import { Input } from './ui/input';


interface CertificateGalleryProps {
  userId: string;
  username: string;
}

export function CertificateGallery({ userId, username: _username }: CertificateGalleryProps) {
  const [certificates, setCertificates] = useState<CertificateData[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'module' | 'course' | 'milestone' | 'excellence'>('all');

  const loadCertificates = useCallback(() => {
    const userCertificates = CertificateService.getUserCertificates(userId);
    setCertificates(userCertificates);
  }, [userId]);

  useEffect(() => {
    loadCertificates();
  }, [loadCertificates]);

  // Filter and search certificates
  const filteredCertificates = certificates.filter(cert => {
    const matchesType = filterType === 'all' || cert.certificateType === filterType;
    const matchesSearch = cert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Group certificates by type
  const certificatesByType = {
    module: certificates.filter(c => c.certificateType === 'module'),
    course: certificates.filter(c => c.certificateType === 'course'),
    milestone: certificates.filter(c => c.certificateType === 'milestone'),
    excellence: certificates.filter(c => c.certificateType === 'excellence'),
  };

  // Get icon for certificate type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'module': return Trophy;
      case 'course': return Award;
      case 'milestone': return Star;
      case 'excellence': return Sparkles;
      default: return Award;
    }
  };

  // Get color for certificate type
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'module': return 'text-purple-500';
      case 'course': return 'text-amber-500';
      case 'milestone': return 'text-blue-500';
      case 'excellence': return 'text-yellow-500';
      default: return 'text-purple-500';
    }
  };

  const renderCertificateCard = (cert: CertificateData) => {
    const Icon = getTypeIcon(cert.certificateType);
    const colorClass = getTypeColor(cert.certificateType);

    return (
      <Card
        key={cert.certificateId}
        className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer group"
      >
        <CardHeader className="space-y-3">
          <div className="flex items-start justify-between">
            <div className={`p-3 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 ${colorClass}`}>
              <Icon className="w-6 h-6" />
            </div>
            <Badge variant="secondary" className="text-xs">
              {cert.certificateType}
            </Badge>
          </div>
          <div className="space-y-1">
            <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
              {cert.title}
            </CardTitle>
            <CardDescription className="line-clamp-2">
              {cert.description}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stats */}
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {cert.completionDate.toLocaleDateString()}
            </div>
            {cert.totalXP && (
              <Badge variant="outline" className="text-xs">
                {cert.totalXP} XP
              </Badge>
            )}
            {cert.grade && (
              <Badge variant="outline" className="text-xs">
                {cert.grade}%
              </Badge>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1"
              onClick={() => setSelectedCertificate(cert)}
            >
              <Eye className="w-3 h-3 mr-1" />
              View
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                // Download would be handled by Certificate component
                setSelectedCertificate(cert);
              }}
            >
              <Download className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <Trophy className="w-8 h-8 mx-auto text-purple-500" />
              <div className="text-2xl font-bold">{certificatesByType.module.length}</div>
              <p className="text-xs text-muted-foreground">Module Certificates</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <Award className="w-8 h-8 mx-auto text-amber-500" />
              <div className="text-2xl font-bold">{certificatesByType.course.length}</div>
              <p className="text-xs text-muted-foreground">Course Certificates</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <Star className="w-8 h-8 mx-auto text-blue-500" />
              <div className="text-2xl font-bold">{certificatesByType.milestone.length}</div>
              <p className="text-xs text-muted-foreground">Milestones</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <Sparkles className="w-8 h-8 mx-auto text-yellow-500" />
              <div className="text-2xl font-bold">{certificatesByType.excellence.length}</div>
              <p className="text-xs text-muted-foreground">Excellence Awards</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search certificates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('all')}
              >
                All
              </Button>
              <Button
                variant={filterType === 'module' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('module')}
              >
                <Trophy className="w-3 h-3 mr-1" />
                Modules
              </Button>
              <Button
                variant={filterType === 'course' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('course')}
              >
                <Award className="w-3 h-3 mr-1" />
                Courses
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Certificates Grid */}
      {filteredCertificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCertificates.map(cert => renderCertificateCard(cert))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16">
            <div className="text-center space-y-4">
              <FileText className="w-16 h-16 mx-auto text-muted-foreground/50" />
              <div className="space-y-2">
                <p className="text-lg font-semibold text-muted-foreground">
                  {searchQuery || filterType !== 'all'
                    ? 'No certificates found'
                    : 'No certificates yet'}
                </p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  {searchQuery || filterType !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'Complete modules and courses to earn certificates and showcase your achievements!'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Certificate Viewer Modal */}
      {selectedCertificate && (
        <Certificate
          data={selectedCertificate}
          onClose={() => setSelectedCertificate(null)}
          showDownloadButton={true}
        />
      )}
    </div>
  );
}
